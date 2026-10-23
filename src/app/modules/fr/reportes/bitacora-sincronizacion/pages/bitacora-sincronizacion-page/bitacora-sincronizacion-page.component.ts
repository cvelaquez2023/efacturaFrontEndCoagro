import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { BitacoraSincronizacionApiService } from "../../service/bitacora-sincronizacion-api.service";
import {
  EstadoSincronizacion,
  IBitacoraSincronizacion,
} from "../../../shared/reportes-fr-model-interface";
import { fmtFecha, fmtHora, hoyIso } from "../../../shared/reporte-utils";
import { abrirReportePdf, IColumnaPdf } from "../../../shared/reporte-pdf";

/**
 * Bitácora de Sincronización (manual FRd pág. 76): cargas y descargas de datos entre las
 * handhelds, las tablas intermedias de FR y el ERP en un rango de fechas, ordenadas por rutero,
 * con hora de inicio/fin y el estado (status) de cada sincronización. Sin compañía.
 */
@Component({
  selector: "app-bitacora-sincronizacion-page",
  templateUrl: "./bitacora-sincronizacion-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./bitacora-sincronizacion-page.component.scss",
  ],
})
export class BitacoraSincronizacionPageComponent
  implements OnInit, AfterViewInit
{
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _bitacoraApi: BitacoraSincronizacionApiService
  ) {}

  readonly backendDisponible: boolean =
    BitacoraSincronizacionApiService.BACKEND_DISPONIBLE;

  filtroForm!: FormGroup;
  consultado = false;
  resultados = new MatTableDataSource<IBitacoraSincronizacion>();
  displayedColumns: string[] = [
    "ruta",
    "handheld",
    "agente",
    "tipo",
    "proceso",
    "fecha",
    "horaInicio",
    "horaFin",
    "registros",
    "estado",
  ];

  readonly fmtFecha = fmtFecha;
  readonly fmtHora = fmtHora;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      desde: [hoyIso(), Validators.required],
      hasta: [hoyIso(), Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
  }

  imprimir(): void {
    const { desde, hasta } = this.filtroForm.value;
    if (this.filtroForm.invalid || desde > hasta) {
      this._snotifyService.warning(
        "Indique un rango de fechas válido (Desde no puede ser mayor que Hasta)",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    this._bitacoraApi.getBitacora(desde, hasta).subscribe((response) => {
      if (!response.success) {
        this._snotifyService.error(response.errors.join(", "), {
          position: SnotifyPosition.rightTop,
        });
        return;
      }
      this.resultados.data = [...response.result].sort(
        (a, b) =>
          a.ruta.localeCompare(b.ruta) ||
          String(a.horaInicio).localeCompare(String(b.horaInicio))
      );
      this.consultado = true;
    });
  }

  cancelar(): void {
    this.filtroForm.reset({ desde: hoyIso(), hasta: hoyIso() });
    this.resultados.data = [];
    this.consultado = false;
  }

  claseEstado(estado: EstadoSincronizacion): string {
    return estado === "Exitosa"
      ? "ok"
      : estado === "Con errores"
      ? "error"
      : "proceso";
  }

  pdf(): void {
    const { desde, hasta } = this.filtroForm.value;
    const columnas: IColumnaPdf[] = [
      { header: "Ruta", valor: (f: IBitacoraSincronizacion) => f.ruta },
      { header: "HandHeld", valor: (f: IBitacoraSincronizacion) => f.handheld },
      { header: "Agente", valor: (f: IBitacoraSincronizacion) => f.agente },
      { header: "Tipo", valor: (f: IBitacoraSincronizacion) => f.tipo },
      { header: "Proceso", valor: (f: IBitacoraSincronizacion) => f.proceso },
      { header: "Fecha", valor: (f: IBitacoraSincronizacion) => fmtFecha(f.fecha) },
      { header: "Inicio", valor: (f: IBitacoraSincronizacion) => fmtHora(f.horaInicio) },
      { header: "Fin", valor: (f: IBitacoraSincronizacion) => fmtHora(f.horaFin) },
      {
        header: "Registros",
        valor: (f: IBitacoraSincronizacion) => f.registros,
        alignment: "right",
      },
      { header: "Estado", valor: (f: IBitacoraSincronizacion) => f.estado },
    ];
    abrirReportePdf({
      titulo: "Bitácora de Sincronización",
      filtros: [
        `Fechas de Auditoría: ${fmtFecha(desde + "T00:00")} al ${fmtFecha(
          hasta + "T00:00"
        )}`,
      ],
      horizontal: true,
      secciones: [
        {
          columnas,
          filas: this.resultados.filteredData,
          vacio: this.backendDisponible
            ? undefined
            : "Sin datos — pendiente backend (no existe aún el registro de sincronizaciones).",
        },
      ],
    });
  }
}
