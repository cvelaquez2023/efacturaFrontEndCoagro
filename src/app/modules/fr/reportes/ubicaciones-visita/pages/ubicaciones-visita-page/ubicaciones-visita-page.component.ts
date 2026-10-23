import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import { RutaApiService } from "../../../../rutas/rutas/service/ruta-api.service";
import { RazonVisitaApiService } from "../../../../administracion/razones-visita/service/razon-visita-api.service";
import { ClienteAsocRtApiService } from "../../../../administracion/clientes/service/cliente-asoc-rt-api.service";
import {
  mensajeError,
  ReportesFrApiService,
} from "../../../shared/reportes-fr-api.service";
import {
  distanciaMetros,
  enRango,
  fmtFecha,
  fmtHora,
  hoyIso,
} from "../../../shared/reporte-utils";
import { abrirReportePdf, IColumnaPdf } from "../../../shared/reporte-pdf";

type EstadoUbicacion =
  | "Dentro GPS"
  | "Fuera GPS"
  | "Sin GPS en visita"
  | "Sin ubicación de cliente";

interface IUbicacionVisita {
  ruta: string;
  cliente: string;
  nombre: string;
  inicio: string;
  razon: string;
  razonCodigo: string;
  latVisita: number | null;
  lonVisita: number | null;
  latCliente: number | null;
  lonCliente: number | null;
  distancia: number | null;
  estado: EstadoUbicacion;
}

const TOP_VISITAS = 60000;

const coordenada = (valor: unknown): number | null => {
  if (valor == null || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

/**
 * Ubicaciones por Visita (manual FRd pág. 84): compara el punto GPS donde se hizo cada visita
 * (VISITA_UBICACION, vía /fr/reporteVisita) con la ubicación registrada del cliente (CLIENTE_RT
 * LATITUD/LONGITUD, vía clienteAsocRt -> clienteRt) para determinar si la visita se hizo dentro de
 * la distancia permitida. Filtros: rango de rutas, rango de razones de visita, estado (Dentro /
 * Fuera GPS) y rango de fechas. Sin compañía.
 */
@Component({
  selector: "app-ubicaciones-visita-page",
  templateUrl: "./ubicaciones-visita-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./ubicaciones-visita-page.component.scss",
  ],
})
export class UbicacionesVisitaPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _rutaApiService: RutaApiService,
    private _razonVisitaApi: RazonVisitaApiService,
    private _clienteAsocApi: ClienteAsocRtApiService,
    private _reportesApi: ReportesFrApiService
  ) {}

  filtroForm!: FormGroup;
  rutasF1: IF1Item[] = [];
  razonesF1: IF1Item[] = [];
  consultado = false;
  resultados = new MatTableDataSource<IUbicacionVisita>();
  displayedColumns: string[] = [
    "ruta",
    "cliente",
    "nombre",
    "fecha",
    "hora",
    "razon",
    "ubicacionVisita",
    "ubicacionCliente",
    "distancia",
    "estado",
  ];
  readonly fmtFecha = fmtFecha;
  readonly fmtHora = fmtHora;

  private _ubicacionCliente = new Map<
    string,
    { nombre: string; lat: number | null; lon: number | null }
  >();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      rutaDesde: [""],
      rutaHasta: [""],
      razonDesde: [""],
      razonHasta: [""],
      dentroGps: [false],
      fueraGps: [false],
      desde: [hoyIso(), Validators.required],
      hasta: [hoyIso(), Validators.required],
      distancia: [100, [Validators.required, Validators.min(1)]],
    });
    forkJoin({
      rutas: this._rutaApiService.getRutas(),
      // Si /fr/efectividadVisita falla (hoy no está montada en el backend), igual cargan rutas y clientes.
      razones: this._razonVisitaApi.getRazonVisita().pipe(catchError(() => of(null))),
      clientes: this._clienteAsocApi.getClientesConNombre(),
    }).subscribe(({ rutas, razones, clientes }) => {
      this.rutasF1 = (rutas.result || []).map((r) => ({
        codigo: r.RUTA,
        nombre: r.DESCRIPCION,
      }));
      this.razonesF1 = (razones?.result || []).map((r) => ({
        codigo: r.EFECT_VISITA,
        nombre: r.DESCRIPCION,
      }));
      this._ubicacionCliente = new Map(
        (clientes.result || []).map((c) => {
          let lat = coordenada(c.LATITUD);
          let lon = coordenada(c.LONGITUD);
          // 0,0 es el valor por defecto de un cliente al que nunca se le cargó ubicación.
          if (lat === 0 && lon === 0) lat = lon = null;
          return [String(c.CODIGO).trim(), { nombre: c.NOMBRE, lat, lon }];
        })
      );
    });
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
    this.resultados.sortingDataAccessor = (fila, columna) => {
      switch (columna) {
        case "fecha":
        case "hora":
          return fila.inicio;
        case "distancia":
          return fila.distancia ?? Number.MAX_SAFE_INTEGER;
        case "ubicacionVisita":
          return fila.latVisita ?? 0;
        case "ubicacionCliente":
          return fila.latCliente ?? 0;
        default:
          return String(fila[columna as keyof IUbicacionVisita] ?? "");
      }
    };
  }

  imprimir(): void {
    const f = this.filtroForm.value;
    if (this.filtroForm.invalid || f.desde > f.hasta) {
      this._snotifyService.warning(
        "Indique un rango de fechas válido y una distancia permitida mayor a cero",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    const radio = Number(f.distancia);
    const estados = new Set<EstadoUbicacion>();
    if (f.dentroGps) estados.add("Dentro GPS");
    if (f.fueraGps) estados.add("Fuera GPS");

    this._reportesApi
      .getVisitas({ desde: f.desde, hasta: f.hasta }, TOP_VISITAS)
      .subscribe({
        next: (visitas) => {
          this.resultados.data = visitas
            .filter((v) => enRango(v.RUTA, f.rutaDesde, f.rutaHasta))
            .filter((v) => enRango(v.RAZON, f.razonDesde, f.razonHasta))
            .map((v): IUbicacionVisita => {
              const cliente = String(v.CLIENTE).trim();
              const ubic = this._ubicacionCliente.get(cliente);
              const latVisita = coordenada(v.LATITUD);
              const lonVisita = coordenada(v.LONGITUD);
              const latCliente = ubic?.lat ?? null;
              const lonCliente = ubic?.lon ?? null;
              let distancia: number | null = null;
              let estado: EstadoUbicacion;
              if (latVisita === null || lonVisita === null) {
                estado = "Sin GPS en visita";
              } else if (latCliente === null || lonCliente === null) {
                estado = "Sin ubicación de cliente";
              } else {
                distancia = Math.round(
                  distanciaMetros(latVisita, lonVisita, latCliente, lonCliente)
                );
                estado = distancia <= radio ? "Dentro GPS" : "Fuera GPS";
              }
              return {
                ruta: v.RUTA,
                cliente,
                nombre: v.CLIENTE_NOMBRE || ubic?.nombre || "",
                inicio: v.INICIO,
                razon: v.RAZON_DESCRIPCION ?? v.RAZON ?? "",
                razonCodigo: v.RAZON ?? "",
                latVisita,
                lonVisita,
                latCliente,
                lonCliente,
                distancia,
                estado,
              };
            })
            // Sin ninguna casilla marcada se muestran todas las visitas.
            .filter((u) => !estados.size || estados.has(u.estado))
            .sort(
              (a, b) =>
                a.ruta.localeCompare(b.ruta, undefined, { numeric: true }) ||
                a.inicio.localeCompare(b.inicio)
            );
          this.consultado = true;
          this.paginator?.firstPage();
        },
        error: (error: unknown) =>
          this._snotifyService.error(mensajeError(error), {
            position: SnotifyPosition.rightTop,
          }),
      });
  }

  cancelar(): void {
    this.filtroForm.reset({
      rutaDesde: "",
      rutaHasta: "",
      razonDesde: "",
      razonHasta: "",
      dentroGps: false,
      fueraGps: false,
      desde: hoyIso(),
      hasta: hoyIso(),
      distancia: 100,
    });
    this.resultados.data = [];
    this.consultado = false;
  }

  cantidad(estado: EstadoUbicacion): number {
    return this.resultados.data.filter((u) => u.estado === estado).length;
  }

  claseEstado(estado: EstadoUbicacion): string {
    switch (estado) {
      case "Dentro GPS":
        return "ok";
      case "Fuera GPS":
        return "error";
      default:
        return "neutro";
    }
  }

  coords(lat: number | null, lon: number | null): string {
    return lat === null || lon === null ? "" : `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }

  mapa(lat: number | null, lon: number | null): string {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }

  pdf(): void {
    const f = this.filtroForm.value;
    const estadosTexto =
      [f.dentroGps && "Dentro GPS", f.fueraGps && "Fuera GPS"]
        .filter(Boolean)
        .join(", ") || "Todos";
    const columnas: IColumnaPdf[] = [
      { header: "Ruta", valor: (u: IUbicacionVisita) => u.ruta },
      { header: "Cliente", valor: (u: IUbicacionVisita) => u.cliente },
      { header: "Nombre", valor: (u: IUbicacionVisita) => u.nombre, width: "*" },
      { header: "Fecha", valor: (u: IUbicacionVisita) => fmtFecha(u.inicio) },
      { header: "Hora", valor: (u: IUbicacionVisita) => fmtHora(u.inicio) },
      { header: "Razón", valor: (u: IUbicacionVisita) => u.razon },
      {
        header: "Ubicación visita",
        valor: (u: IUbicacionVisita) => this.coords(u.latVisita, u.lonVisita),
      },
      {
        header: "Ubicación cliente",
        valor: (u: IUbicacionVisita) => this.coords(u.latCliente, u.lonCliente),
      },
      {
        header: "Distancia (m)",
        valor: (u: IUbicacionVisita) => u.distancia,
        alignment: "right",
      },
      { header: "Estado", valor: (u: IUbicacionVisita) => u.estado },
    ];
    abrirReportePdf({
      titulo: "Reporte de Ubicaciones por Visita",
      filtros: [
        `Rutas: ${f.rutaDesde || "(inicio)"} a ${f.rutaHasta || "(fin)"}`,
        `Razón visita: ${f.razonDesde || "(inicio)"} a ${f.razonHasta || "(fin)"}`,
        `Estado visita: ${estadosTexto} · Distancia permitida: ${f.distancia} m`,
        `Fechas: ${fmtFecha(f.desde + "T00:00")} al ${fmtFecha(f.hasta + "T00:00")}`,
      ],
      horizontal: true,
      secciones: [{ columnas, filas: this.resultados.filteredData }],
    });
  }
}
