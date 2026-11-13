import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin } from "rxjs";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import { RutaApiService } from "../../../../rutas/rutas/service/ruta-api.service";
import {
  mensajeError,
  ReportesFrApiService,
} from "../../../shared/reportes-fr-api.service";
import {
  asignarPedidos,
  enRango,
  exportarCsv,
  fmtFecha,
  fmtHora,
  hoyIso,
} from "../../../shared/reporte-utils";
import { abrirReportePdf, IColumnaPdf } from "../../../shared/reporte-pdf";

/** Una visita en la que el representante no logró la venta. */
interface INoVenta {
  ruta: string;
  rutaDescripcion: string;
  cliente: string;
  nombre: string;
  inicio: string;
  motivo: string;
  notas: string;
}

/** Conteo de visitas sin venta por motivo (la tarjeta "Motivos de no venta"). */
interface IConteoMotivo {
  motivo: string;
  cantidad: number;
  porcentaje: number;
}

const SIN_MOTIVO = "Sin motivo registrado";
const TOP_VISITAS = 60000;

/**
 * Motivos de No Venta: visitas (erpadmin.VISITA) en las que no hubo pedido (sin DOC_PRO y sin
 * pedido en alFAC_ENC_PED dentro de la visita), agrupadas por el motivo que registró el
 * representante (VISITA.RAZON → EFECT_VISITA_RT, catálogo de Razones de Visita). Sin compañía.
 */
@Component({
  selector: "app-motivos-no-venta-page",
  templateUrl: "./motivos-no-venta-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./motivos-no-venta-page.component.scss",
  ],
})
export class MotivosNoVentaPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _rutaApiService: RutaApiService,
    private _reportesApi: ReportesFrApiService
  ) {}

  filtroForm!: FormGroup;
  rutasF1: IF1Item[] = [];
  cargando = false;
  consultado = false;
  totalVisitas = 0;
  conteo: IConteoMotivo[] = [];
  resultados = new MatTableDataSource<INoVenta>();
  displayedColumns = ["fecha", "hora", "ruta", "cliente", "nombre", "motivo", "notas"];
  readonly fmtFecha = fmtFecha;
  readonly fmtHora = fmtHora;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      rutaDesde: [""],
      rutaHasta: [""],
      desde: [hoyIso(), Validators.required],
      hasta: [hoyIso(), Validators.required],
    });
    this._rutaApiService.getRutas().subscribe((rutas) => {
      this.rutasF1 = (rutas.result || []).map((r) => ({
        codigo: r.RUTA,
        nombre: r.DESCRIPCION,
      }));
    });
    this.imprimir();
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
    // El filtro es el motivo exacto elegido en la tarjeta (no una búsqueda de texto).
    this.resultados.filterPredicate = (fila, motivo) => fila.motivo === motivo;
    this.resultados.sortingDataAccessor = (fila, columna) =>
      columna === "fecha" || columna === "hora"
        ? fila.inicio
        : String(fila[columna as keyof INoVenta] ?? "");
  }

  imprimir(): void {
    const f = this.filtroForm.value;
    if (this.filtroForm.invalid || f.desde > f.hasta) {
      this._snotifyService.warning("Indique un rango de fechas válido", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    const filtroFecha = { desde: f.desde, hasta: f.hasta };
    this.cargando = true;
    forkJoin({
      visitas: this._reportesApi.getVisitas(filtroFecha, TOP_VISITAS),
      pedidos: this._reportesApi.getPedidos(filtroFecha, TOP_VISITAS),
    }).subscribe({
      next: ({ visitas, pedidos }) => {
        const pedidosDeVisita = asignarPedidos(visitas, pedidos);
        const nombreRuta = new Map(
          this.rutasF1.map((r) => [String(r.codigo).trim(), r.nombre])
        );
        const deRuta = visitas.filter((v) => enRango(v.RUTA, f.rutaDesde, f.rutaHasta));
        const sinVenta = deRuta.filter(
          (v) => !String(v.DOC_PRO ?? "").trim() && !pedidosDeVisita.get(v)?.length
        );

        this.totalVisitas = deRuta.length;
        this.resultados.data = sinVenta
          .map((v): INoVenta => {
            const ruta = String(v.RUTA).trim();
            return {
              ruta,
              rutaDescripcion: v.RUTA_DESCRIPCION || nombreRuta.get(ruta) || "",
              cliente: String(v.CLIENTE).trim(),
              nombre: v.CLIENTE_NOMBRE ?? "",
              inicio: v.INICIO,
              motivo: (v.RAZON_DESCRIPCION || v.RAZON || "").trim() || SIN_MOTIVO,
              notas: (v.NOTAS ?? "").trim(),
            };
          })
          .sort((a, b) => b.inicio.localeCompare(a.inicio));

        const porMotivo = new Map<string, number>();
        this.resultados.data.forEach((n) =>
          porMotivo.set(n.motivo, (porMotivo.get(n.motivo) ?? 0) + 1)
        );
        const total = this.resultados.data.length;
        this.conteo = Array.from(porMotivo, ([motivo, cantidad]) => ({
          motivo,
          cantidad,
          porcentaje: total ? (cantidad / total) * 100 : 0,
        })).sort((a, b) => b.cantidad - a.cantidad || a.motivo.localeCompare(b.motivo));

        this.consultado = true;
        this.cargando = false;
        this.paginator?.firstPage();
      },
      error: (error: unknown) => {
        this.cargando = false;
        this._snotifyService.error(mensajeError(error), {
          position: SnotifyPosition.rightTop,
        });
      },
    });
  }

  cancelar(): void {
    this.filtroForm.reset({
      rutaDesde: "",
      rutaHasta: "",
      desde: hoyIso(),
      hasta: hoyIso(),
    });
    this.resultados.data = [];
    this.conteo = [];
    this.totalVisitas = 0;
    this.consultado = false;
  }

  /** Clic en un motivo de la tarjeta: filtra el detalle por ese motivo (otro clic lo quita). */
  filtrarMotivo(motivo: string): void {
    this.resultados.filter = this.resultados.filter === motivo ? "" : motivo;
    this.paginator?.firstPage();
  }

  get motivoFiltrado(): string {
    return this.resultados.filter;
  }

  private _filtrosTexto(): string[] {
    const f = this.filtroForm.value;
    return [
      `Fechas: ${fmtFecha(f.desde + "T00:00")} al ${fmtFecha(f.hasta + "T00:00")}`,
      `Rutas: ${f.rutaDesde || "(inicio)"} a ${f.rutaHasta || "(fin)"}`,
      `Visitas: ${this.totalVisitas} · Sin venta: ${this.resultados.data.length}`,
    ];
  }

  private _columnasDetalle(): IColumnaPdf[] {
    return [
      { header: "Fecha", valor: (n: INoVenta) => fmtFecha(n.inicio) },
      { header: "Hora", valor: (n: INoVenta) => fmtHora(n.inicio) },
      { header: "Ruta", valor: (n: INoVenta) => n.ruta },
      { header: "Cliente", valor: (n: INoVenta) => n.cliente },
      { header: "Nombre", valor: (n: INoVenta) => n.nombre, width: "*" },
      { header: "Motivo", valor: (n: INoVenta) => n.motivo },
      { header: "Notas", valor: (n: INoVenta) => n.notas, width: "*" },
    ];
  }

  pdf(): void {
    abrirReportePdf({
      titulo: "Reporte de Motivos de No Venta",
      filtros: this._filtrosTexto(),
      horizontal: true,
      secciones: [
        {
          titulo: "Motivos de no venta",
          columnas: [
            { header: "Motivo", valor: (c: IConteoMotivo) => c.motivo, width: "*" },
            { header: "Visitas", valor: (c: IConteoMotivo) => c.cantidad, alignment: "right" },
            { header: "%", valor: (c: IConteoMotivo) => c.porcentaje.toFixed(1) + " %", alignment: "right" },
          ],
          filas: this.conteo,
          vacio: "No hay visitas sin venta en el rango indicado.",
        },
        {
          titulo: "Detalle de visitas sin venta",
          columnas: this._columnasDetalle(),
          filas: this.resultados.filteredData,
          vacio: "No hay visitas sin venta en el rango indicado.",
        },
      ],
    });
  }

  csv(): void {
    exportarCsv(
      "motivos-no-venta",
      this._columnasDetalle().map((c) => ({ header: c.header, valor: c.valor })),
      this.resultados.filteredData
    );
  }
}
