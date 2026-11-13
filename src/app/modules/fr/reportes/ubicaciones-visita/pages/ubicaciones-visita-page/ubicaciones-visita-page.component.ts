import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, merge, of } from "rxjs";
import { catchError, debounceTime } from "rxjs/operators";
import {
  IClienteUbicacion,
  IReporteVisita,
} from "../../../shared/reportes-fr-model-interface";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import { RutaApiService } from "../../../../rutas/rutas/service/ruta-api.service";
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
import {
  abrirReporteRuteroPdf,
  fmtPorcentaje,
  IRecuadroPdf,
} from "../../../shared/reporte-pdf-rutero";

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

/** Desde por defecto = hoy (el día en que la persona entra a la pantalla). */
const desdeDefault = (): string => hoyIso();

const coordenada = (valor: unknown): number | null => {
  if (valor == null || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

/**
 * Ubicaciones por Visita (manual FRd pág. 84): compara el punto GPS donde se hizo cada visita
 * (VISITA_UBICACION, vía /fr/reporteVisita) con el punto que la handheld guardó la primera vez
 * para el cliente (CLIENTE_UBICACION, vía /fr/clienteUbicacion; llave RUTA + CLIENTE) para
 * determinar si la visita se hizo dentro de
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

  /** Visitas tal como llegan del backend para el rango de fechas consultado. */
  private _visitas: IReporteVisita[] = [];
  /** Todas las visitas ya calculadas (ruta/razón aplicadas) antes del filtro Dentro/Fuera. */
  private _todas: IUbicacionVisita[] = [];

  /** Punto del cliente (CLIENTE_UBICACION) por "RUTA|CLIENTE" y, de respaldo, solo por CLIENTE. */
  private _ubicacionCliente = new Map<string, { lat: number; lon: number; nombre: string }>();
  /** true si no se pudo leer /fr/clienteUbicacion (la pantalla lo avisa). */
  ubicacionesClienteNoDisponibles = false;

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
      desde: [desdeDefault(), Validators.required],
      hasta: [hoyIso(), Validators.required],
      distancia: [100, [Validators.required, Validators.min(1)]],
    });
    // Ruta, razón, Dentro/Fuera y distancia se aplican al momento sobre lo ya consultado; solo
    // las fechas necesitan volver a consultar al backend (botón Imprimir).
    merge(
      ...["rutaDesde", "rutaHasta", "razonDesde", "razonHasta", "dentroGps", "fueraGps", "distancia"]
        .map((c) => this.filtroForm.get(c)!.valueChanges)
    )
      .pipe(debounceTime(150))
      .subscribe(() => {
        if (this.consultado && this.filtroForm.get("distancia")!.valid) this._construir();
      });

    // Rutas y ubicación de clientes; luego se consulta de una vez para abrir con lo más reciente.
    // Las razones salen de las mismas visitas (/fr/efectividadVisita no está montada en el backend).
    this._rutaApiService.getRutas().subscribe((rutas) => {
      this.rutasF1 = (rutas.result || []).map((r) => ({
        codigo: r.RUTA,
        nombre: r.DESCRIPCION,
      }));
    });
    this.imprimir();
  }

  /** Dentro y Fuera GPS son excluyentes: marcar uno desmarca el otro (o ninguno = todas). */
  cambioEstado(marcado: "dentroGps" | "fueraGps"): void {
    const otro = marcado === "dentroGps" ? "fueraGps" : "dentroGps";
    if (this.filtroForm.get(marcado)!.value) {
      this.filtroForm.get(otro)!.setValue(false);
    }
  }

  private _cargarUbicacionesCliente(filas: IClienteUbicacion[]): void {
    const mapa = new Map<string, { lat: number; lon: number; nombre: string }>();
    filas.forEach((u) => {
      const lat = coordenada(u.LATITUD);
      const lon = coordenada(u.LONGITUD);
      // Sin coordenadas o 0,0 = el cliente no tiene punto registrado.
      if (lat === null || lon === null || (lat === 0 && lon === 0)) return;
      const ruta = String(u.RUTA ?? "").trim();
      const cliente = String(u.CLIENTE ?? "").trim();
      const punto = { lat, lon, nombre: String(u.CLIENTE_NOMBRE ?? "").trim() };
      mapa.set(`${ruta}|${cliente}`, punto);
      if (!mapa.has(cliente)) mapa.set(cliente, punto);
    });
    this._ubicacionCliente = mapa;
  }

  /** "En vivo": si el rango termina antes de hoy (p. ej. pasó la medianoche) se extiende a hoy,
   *  para que entren las visitas nuevas. */
  refrescarEnVivo(): void {
    const hoy = hoyIso();
    if (this.filtroForm.value.hasta < hoy) {
      this.filtroForm.patchValue({ hasta: hoy });
    }
    this.imprimir();
  }

  /** Las razones del filtro F1 se arman con las que traen las visitas consultadas. */
  private _agregarRazones(
    visitas: { RAZON: string | null; RAZON_DESCRIPCION: string | null }[]
  ): void {
    const razones = new Map(this.razonesF1.map((r) => [r.codigo, r]));
    visitas.forEach((v) => {
      const codigo = String(v.RAZON ?? "").trim();
      if (codigo && !razones.has(codigo)) {
        razones.set(codigo, { codigo, nombre: v.RAZON_DESCRIPCION ?? "" });
      }
    });
    this.razonesF1 = Array.from(razones.values()).sort((a, b) =>
      a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
    );
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
    // Cada consulta relee CLIENTE_UBICACION para incluir clientes georreferenciados recién.
    forkJoin({
      visitas: this._reportesApi.getVisitas({ desde: f.desde, hasta: f.hasta }, TOP_VISITAS),
      // Si el endpoint ya falló en esta pantalla no se reintenta (evita el mismo error cada
      // minuto en modo En vivo); al volver a entrar a la pantalla se intenta de nuevo.
      ubicaciones: this.ubicacionesClienteNoDisponibles
        ? of(null)
        : this._reportesApi.getClienteUbicaciones().pipe(catchError(() => of(null))),
    })
      .subscribe({
        next: ({ visitas, ubicaciones }) => {
          this.ubicacionesClienteNoDisponibles = ubicaciones === null;
          this._cargarUbicacionesCliente(ubicaciones ?? []);
          this._agregarRazones(visitas);
          this._visitas = visitas;
          this._construir();
          this.consultado = true;
          this.paginator?.firstPage();
        },
        error: (error: unknown) =>
          this._snotifyService.error(mensajeError(error), {
            position: SnotifyPosition.rightTop,
          }),
      });
  }

  /** Calcula distancia y estado de cada visita con los filtros actuales. Sin Dentro ni Fuera
   *  marcados se muestran todas; con Dentro solo las de dentro; con Fuera solo las de fuera. */
  private _construir(): void {
    const f = this.filtroForm.value;
    const radio = Number(f.distancia);
    const estados = new Set<EstadoUbicacion>();
    if (f.dentroGps) estados.add("Dentro GPS");
    if (f.fueraGps) estados.add("Fuera GPS");

    this._todas = this._visitas
      .filter((v) => enRango(v.RUTA, f.rutaDesde, f.rutaHasta))
      .filter((v) => enRango(v.RAZON, f.razonDesde, f.razonHasta))
      .map((v): IUbicacionVisita => {
        const cliente = String(v.CLIENTE).trim();
        // Punto del cliente en la misma ruta de la visita; si no hay, el de otra ruta.
        const ubic =
          this._ubicacionCliente.get(`${String(v.RUTA ?? "").trim()}|${cliente}`) ??
          this._ubicacionCliente.get(cliente);
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
      .sort(
        (a, b) =>
          a.ruta.localeCompare(b.ruta, undefined, { numeric: true }) ||
          a.inicio.localeCompare(b.inicio)
      );
    this.resultados.data = this._todas.filter(
      (u) => !estados.size || estados.has(u.estado)
    );
  }

  /** Visitas fuera del radio (sobre todo el rango, sin importar el filtro Dentro/Fuera). */
  get visitasFuera(): IUbicacionVisita[] {
    return this._todas.filter((u) => u.estado === "Fuera GPS");
  }

  get rutasFuera(): string {
    return Array.from(new Set(this.visitasFuera.map((u) => u.ruta)))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .join(", ");
  }

  /** Solo muestra las visitas fuera de rango (atajo desde la alerta). */
  verSoloFuera(): void {
    this.filtroForm.patchValue({ dentroGps: false, fueraGps: true });
  }

  cancelar(): void {
    this.filtroForm.reset({
      rutaDesde: "",
      rutaHasta: "",
      razonDesde: "",
      razonHasta: "",
      dentroGps: false,
      fueraGps: false,
      desde: desdeDefault(),
      hasta: hoyIso(),
      distancia: 100,
    });
    this._visitas = [];
    this._todas = [];
    this.resultados.data = [];
    this.consultado = false;
    this.imprimir();
  }

  cantidad(estado: EstadoUbicacion): number {
    return this._todas.filter((u) => u.estado === estado).length;
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

  /** Reporte con el formato de Softland FR: resumen por estado y por ruta, y un recuadro por ruta
   *  con sus visitas y la distancia al punto del cliente. */
  generarReporte(): void {
    const f = this.filtroForm.value;
    const filas = this.resultados.filteredData;
    const estadosTexto =
      [f.dentroGps && "Dentro GPS", f.fueraGps && "Fuera GPS"]
        .filter(Boolean)
        .join(", ") || "Todos";
    const contar = (estado: EstadoUbicacion, lista = filas) =>
      lista.filter((u) => u.estado === estado).length;
    const pct = (parte: number, total: number) => (total ? (parte / total) * 100 : 0);
    const rutas = Array.from(new Set(filas.map((u) => u.ruta))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const porRuta = rutas.map((ruta) => {
      const deRuta = filas.filter((u) => u.ruta === ruta);
      return {
        ruta: `${ruta} ${this.rutasF1.find((r) => r.codigo === ruta)?.nombre ?? ""}`.trim(),
        visitas: deRuta.length,
        dentro: contar("Dentro GPS", deRuta),
        fuera: contar("Fuera GPS", deRuta),
        pct: fmtPorcentaje(pct(contar("Dentro GPS", deRuta), deRuta.length)),
      };
    });
    const resumen: [string, string][] = [
      ["Visitas :", String(filas.length)],
      ["Dentro GPS :", String(contar("Dentro GPS"))],
      ["Fuera GPS :", String(contar("Fuera GPS"))],
      ["Sin GPS en visita :", String(contar("Sin GPS en visita"))],
      ["Sin ubicación de cliente :", String(contar("Sin ubicación de cliente"))],
      ["Porcentaje Dentro GPS :", fmtPorcentaje(pct(contar("Dentro GPS"), filas.length))],
    ];
    const detalle = rutas.map(
      (ruta): IRecuadroPdf[] => [
        {
          titulo: `Ruta ${ruta}`,
          columnas: [
            { header: "Cliente", valor: (u: IUbicacionVisita) => `(${u.cliente}) ${u.nombre}`, width: "*" },
            { header: "Fecha", valor: (u: IUbicacionVisita) => fmtFecha(u.inicio) },
            { header: "Hora", valor: (u: IUbicacionVisita) => fmtHora(u.inicio) },
            { header: "Razón", valor: (u: IUbicacionVisita) => u.razon },
            { header: "Ubicación visita", valor: (u: IUbicacionVisita) => this.coords(u.latVisita, u.lonVisita) },
            { header: "Ubicación cliente", valor: (u: IUbicacionVisita) => this.coords(u.latCliente, u.lonCliente) },
            { header: "Distancia (m)", valor: (u: IUbicacionVisita) => u.distancia, alignment: "right" },
            { header: "Estado", valor: (u: IUbicacionVisita) => u.estado },
          ],
          filas: filas.filter((u) => u.ruta === ruta),
          total: String(filas.filter((u) => u.ruta === ruta).length),
        },
      ]
    );
    abrirReporteRuteroPdf({
      titulo: "Reporte de Ubicaciones por Visita",
      paginas: [
        {
          encabezado: [
            `Fechas: ${fmtFecha(f.desde + "T00:00")} al ${fmtFecha(f.hasta + "T00:00")}`,
            `Rutas: ${f.rutaDesde || "(inicio)"} a ${f.rutaHasta || "(fin)"}. Razón visita: ${
              f.razonDesde || "(inicio)"
            } a ${f.razonHasta || "(fin)"}.`,
            `Estado visita: ${estadosTexto}. Distancia permitida: ${f.distancia} m.`,
          ],
          bloques: [
            [
              {
                titulo: "Resumen",
                cebra: true,
                columnas: [
                  { header: "Descripción", valor: (r: [string, string]) => r[0], width: "*" },
                  { header: "Valor", valor: (r: [string, string]) => r[1], alignment: "right", width: 70 },
                ],
                filas: resumen,
              },
              {
                titulo: "Resumen por Ruta",
                columnas: [
                  { header: "Ruta", valor: (r: typeof porRuta[number]) => r.ruta, width: "*" },
                  { header: "Visitas", valor: (r: typeof porRuta[number]) => r.visitas, alignment: "right" },
                  { header: "Dentro", valor: (r: typeof porRuta[number]) => r.dentro, alignment: "right" },
                  { header: "Fuera", valor: (r: typeof porRuta[number]) => r.fuera, alignment: "right" },
                  { header: "% Dentro", valor: (r: typeof porRuta[number]) => r.pct, alignment: "right" },
                ],
                filas: porRuta,
                total: String(porRuta.length),
              },
            ],
            ...(detalle.length
              ? detalle
              : [
                  [
                    {
                      titulo: "Visitas",
                      columnas: [{ header: "Ruta", valor: () => "", width: "*" }],
                      filas: [],
                      vacio: "Sin visitas para los filtros indicados.",
                    },
                  ],
                ]),
          ],
        },
      ],
    });
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
