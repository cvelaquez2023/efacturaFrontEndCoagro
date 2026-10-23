import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin } from "rxjs";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import {
  mensajeError,
  ReportesFrApiService,
} from "../../../shared/reportes-fr-api.service";
import {
  IAgenteReporte,
  IRutaAsignadaReporte,
} from "../../../shared/reportes-fr-model-interface";
import {
  enRango,
  fmtFecha,
  fmtHora,
  hoyIso,
  inicioMesIso,
} from "../../../shared/reporte-utils";
import {
  abrirReportePdf,
  IColumnaPdf,
  ISeccionPdf,
} from "../../../shared/reporte-pdf";

interface IHistoricoVisita {
  agente: string;
  agenteNombre: string;
  ruta: string;
  cliente: string;
  clienteNombre: string;
  inicio: string;
  fin: string | null;
  duracion: number | null;
  razon: string;
  tipo: string;
  notas: string;
}

/** Tope de visitas a leer del backend para un rango de fechas. */
const TOP_VISITAS = 60000;

/**
 * Histórico de Visitas (manual FRd pág. 78): visitas realizadas por los agentes entre un rango de
 * fechas (fecha de inicio de la visita), opcionalmente filtradas por un rango de agentes. El agente
 * de cada visita es el asignado a su ruta en RUTA_ASIGNADA_RT. Sin compañía.
 */
@Component({
  selector: "app-historico-visitas-page",
  templateUrl: "./historico-visitas-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./historico-visitas-page.component.scss",
  ],
})
export class HistoricoVisitasPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _reportesApi: ReportesFrApiService
  ) {}

  filtroForm!: FormGroup;
  agentesF1: IF1Item[] = [];
  consultado = false;
  resultados = new MatTableDataSource<IHistoricoVisita>();
  displayedColumns: string[] = [
    "agente",
    "agenteNombre",
    "ruta",
    "cliente",
    "clienteNombre",
    "fecha",
    "horaInicio",
    "horaFin",
    "duracion",
    "razon",
    "notas",
  ];
  readonly fmtFecha = fmtFecha;
  readonly fmtHora = fmtHora;

  private _agentes: IAgenteReporte[] = [];
  private _rutasAsignadas: IRutaAsignadaReporte[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      agenteDesde: [""],
      agenteHasta: [""],
      desde: [inicioMesIso(), Validators.required],
      hasta: [hoyIso(), Validators.required],
    });
    forkJoin({
      agentes: this._reportesApi.getAgentes(),
      rutasAsignadas: this._reportesApi.getRutasAsignadas(),
    }).subscribe(({ agentes, rutasAsignadas }) => {
      this._agentes = agentes;
      this._rutasAsignadas = rutasAsignadas;
      this.agentesF1 = agentes.map((a) => ({ codigo: a.codigo, nombre: a.nombre }));
    });
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
    this.resultados.sortingDataAccessor = (fila, columna) => {
      switch (columna) {
        case "fecha":
        case "horaInicio":
          return fila.inicio;
        case "horaFin":
          return fila.fin ?? "";
        case "duracion":
          return fila.duracion ?? -1;
        default:
          return String(fila[columna as keyof IHistoricoVisita] ?? "");
      }
    };
  }

  imprimir(): void {
    const f = this.filtroForm.value;
    if (this.filtroForm.invalid || f.desde > f.hasta) {
      this._snotifyService.warning(
        "Indique un rango de fechas de visita válido",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    this._reportesApi
      .getVisitas({ desde: f.desde, hasta: f.hasta }, TOP_VISITAS)
      .subscribe({
        next: (visitas) => {
          const agenteDeRuta = new Map(
            this._rutasAsignadas.map((r) => [
              String(r.RUTA).trim(),
              String(r.AGENTE ?? "").trim(),
            ])
          );
          const nombreAgente = new Map(
            this._agentes.map((a) => [a.codigo, a.nombre])
          );
          const filtraAgente = !!(f.agenteDesde || f.agenteHasta);
          this.resultados.data = visitas
            .map((v) => {
              const agente = agenteDeRuta.get(String(v.RUTA).trim()) ?? "";
              return {
                agente,
                agenteNombre: nombreAgente.get(agente) ?? "",
                ruta: v.RUTA,
                cliente: v.CLIENTE,
                clienteNombre: v.CLIENTE_NOMBRE ?? "",
                inicio: v.INICIO,
                fin: v.FIN,
                duracion: v.DURACION_MIN,
                razon: v.RAZON_DESCRIPCION ?? v.RAZON ?? "",
                tipo: v.TIPO ?? "",
                notas: v.NOTAS ?? "",
              };
            })
            .filter(
              (v) =>
                !filtraAgente ||
                (v.agente !== "" && enRango(v.agente, f.agenteDesde, f.agenteHasta))
            )
            .sort(
              (a, b) =>
                a.agente.localeCompare(b.agente, undefined, { numeric: true }) ||
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
      agenteDesde: "",
      agenteHasta: "",
      desde: inicioMesIso(),
      hasta: hoyIso(),
    });
    this.resultados.data = [];
    this.consultado = false;
  }

  /** PDF agrupado por agente, como el reporte de Softland. */
  pdf(): void {
    const f = this.filtroForm.value;
    const columnas: IColumnaPdf[] = [
      { header: "Ruta", valor: (v: IHistoricoVisita) => v.ruta },
      { header: "Cliente", valor: (v: IHistoricoVisita) => v.cliente },
      { header: "Nombre", valor: (v: IHistoricoVisita) => v.clienteNombre, width: "*" },
      { header: "Fecha", valor: (v: IHistoricoVisita) => fmtFecha(v.inicio) },
      { header: "Inicio", valor: (v: IHistoricoVisita) => fmtHora(v.inicio) },
      { header: "Fin", valor: (v: IHistoricoVisita) => fmtHora(v.fin) },
      {
        header: "Min.",
        valor: (v: IHistoricoVisita) => v.duracion,
        alignment: "right",
      },
      { header: "Razón", valor: (v: IHistoricoVisita) => v.razon },
      { header: "Notas", valor: (v: IHistoricoVisita) => v.notas, width: 120 },
    ];
    const grupos = new Map<string, IHistoricoVisita[]>();
    this.resultados.filteredData.forEach((v) => {
      const clave = v.agente
        ? `Agente ${v.agente}${v.agenteNombre ? " - " + v.agenteNombre : ""}`
        : "Ruta sin agente asignado";
      grupos.set(clave, [...(grupos.get(clave) ?? []), v]);
    });
    const secciones: ISeccionPdf[] = Array.from(grupos.entries()).map(
      ([titulo, filas]) => ({
        titulo: `${titulo} (${filas.length} visita(s))`,
        columnas,
        filas,
      })
    );
    abrirReportePdf({
      titulo: "Reporte de Histórico de Visitas",
      filtros: [
        `Agentes: ${f.agenteDesde || "(inicio)"} a ${f.agenteHasta || "(fin)"}`,
        `Fechas de visita: ${fmtFecha(f.desde + "T00:00")} al ${fmtFecha(
          f.hasta + "T00:00"
        )}`,
      ],
      horizontal: true,
      secciones: secciones.length ? secciones : [{ columnas, filas: [] }],
    });
  }
}
