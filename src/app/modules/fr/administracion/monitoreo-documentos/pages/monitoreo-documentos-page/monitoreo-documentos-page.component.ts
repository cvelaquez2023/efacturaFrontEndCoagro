import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { PATHS_FR_PAGES } from "@app/config/path-page-fr";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import { RutaApiService } from "../../../../rutas/rutas/service/ruta-api.service";
import { ReportesFrApiService } from "../../../../reportes/shared/reportes-fr-api.service";
import {
  IAgenteReporte,
  IRutaAsignadaReporte,
} from "../../../../reportes/shared/reportes-fr-model-interface";
import {
  abrirSelectorF1,
  exportarCsv,
  fmtFecha,
  fmtHora,
  hoyIso,
  inicioMesIso,
} from "../../../../reportes/shared/reporte-utils";
import { abrirReportePdf } from "../../../../reportes/shared/reporte-pdf";
import { MonitoreoDocumentosApiService } from "../../service/monitoreo-documentos-api.service";
import {
  IColumnaMonitor,
  IFilaMonitoreo,
  IFiltroMonitoreo,
  ITabMonitor,
  TABS_MONITOR,
  TipoDocumentoMonitor,
} from "../../model/monitoreo-documentos-model-interface";

/**
 * Monitor de Documentos (manual FRd pág. 135): filtro por rango de fechas, ruta, handheld, agente
 * y Top; botones a la izquierda y pestañas sobre la tabla para cambiar de tipo de documento;
 * mostrar/ocultar columnas, imprimir (PDF) y exportar a Excel (CSV). Sin compañía.
 */
@Component({
  selector: "app-monitoreo-documentos-page",
  templateUrl: "./monitoreo-documentos-page.component.html",
  styleUrls: ["./monitoreo-documentos-page.component.scss"],
})
export class MonitoreoDocumentosPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _dialog: MatDialog,
    private _snotifyService: SnotifyService,
    private _router: Router,
    private _rutaApiService: RutaApiService,
    private _reportesApi: ReportesFrApiService,
    private _monitoreoApi: MonitoreoDocumentosApiService
  ) {}

  filtroForm!: FormGroup;
  tabs: ITabMonitor[] = TABS_MONITOR;
  tabIndex = 0;
  cargando = false;
  consultado = false;

  resultados = new MatTableDataSource<IFilaMonitoreo>();
  private _datos = new Map<TipoDocumentoMonitor, IFilaMonitoreo[]>();
  private _visibles = new Map<TipoDocumentoMonitor, Set<string>>();

  private _rutasF1: IF1Item[] = [];
  private _handheldsF1: IF1Item[] = [];
  private _agentes: IAgenteReporte[] = [];
  private _rutasAsignadas: IRutaAsignadaReporte[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get tabActual(): ITabMonitor {
    return this.tabs[this.tabIndex];
  }

  get columnasVisibles(): IColumnaMonitor[] {
    const visibles = this._visibles.get(this.tabActual.tipo);
    return this.tabActual.columnas.filter((c) => visibles?.has(c.key));
  }

  get displayedColumns(): string[] {
    return this.columnasVisibles.map((c) => c.key);
  }

  get tieneBackend(): boolean {
    return this._monitoreoApi.tiposConBackend.includes(this.tabActual.tipo);
  }

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      fechaInicio: [inicioMesIso(), Validators.required],
      fechaFin: [hoyIso(), Validators.required],
      ruta: [""],
      rutaNombre: [{ value: "", disabled: true }],
      handheld: [""],
      handheldNombre: [{ value: "", disabled: true }],
      agente: [""],
      agenteNombre: [{ value: "", disabled: true }],
      top: [60000, [Validators.required, Validators.min(1)]],
    });
    this.tabs.forEach((t) =>
      this._visibles.set(t.tipo, new Set(t.columnas.map((c) => c.key)))
    );
    this._cargarCatalogos();
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
  }

  private _cargarCatalogos(): void {
    forkJoin({
      rutas: this._rutaApiService.getRutas(),
      handhelds: this._reportesApi.getHandhelds(),
      catalogos: this._monitoreoApi.getCatalogos(),
    }).subscribe({
      next: ({ rutas, handhelds, catalogos }) => {
        this._rutasF1 = (rutas.result || []).map((r) => ({
          codigo: r.RUTA,
          nombre: r.DESCRIPCION,
        }));
        this._handheldsF1 = handhelds.map((h) => ({
          codigo: h.HANDHELD,
          nombre: h.DESCRIPCION,
        }));
        this._agentes = catalogos.agentes;
        this._rutasAsignadas = catalogos.rutasAsignadas;
        this.refrescar();
      },
      error: () =>
        this._snotifyService.error(
          "No se pudieron cargar rutas, handhelds y agentes",
          { position: SnotifyPosition.rightTop }
        ),
    });
  }

  buscarRuta(): void {
    abrirSelectorF1(
      this._dialog,
      "Rutas",
      this._rutasF1,
      this.filtroForm.get("ruta"),
      this.filtroForm.get("rutaNombre")
    );
  }

  buscarHandheld(): void {
    abrirSelectorF1(
      this._dialog,
      "HandHelds",
      this._handheldsF1,
      this.filtroForm.get("handheld"),
      this.filtroForm.get("handheldNombre")
    );
  }

  buscarAgente(): void {
    abrirSelectorF1(
      this._dialog,
      "Agentes",
      this._agentes.map((a) => ({ codigo: a.codigo, nombre: a.nombre })),
      this.filtroForm.get("agente"),
      this.filtroForm.get("agenteNombre")
    );
  }

  /** Al digitar un código a mano, se busca su nombre (o se limpia si no existe). */
  sincronizarNombre(campo: "ruta" | "handheld" | "agente"): void {
    const codigo = String(this.filtroForm.get(campo)?.value ?? "").trim();
    const lista =
      campo === "ruta"
        ? this._rutasF1
        : campo === "handheld"
        ? this._handheldsF1
        : this._agentes.map((a) => ({ codigo: a.codigo, nombre: a.nombre }));
    const item = lista.find((i) => i.codigo === codigo);
    this.filtroForm.get(campo + "Nombre")?.setValue(item?.nombre ?? "");
  }

  private _filtro(): IFiltroMonitoreo {
    const v = this.filtroForm.getRawValue();
    return {
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      ruta: String(v.ruta ?? "").trim(),
      handheld: String(v.handheld ?? "").trim(),
      agente: String(v.agente ?? "").trim(),
      top: Number(v.top) || 60000,
    };
  }

  refrescar(): void {
    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      this._snotifyService.warning("Revise las fechas y el Top", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    const filtro = this._filtro();
    if (filtro.fechaInicio > filtro.fechaFin) {
      this._snotifyService.warning(
        "La Fecha Inicio no puede ser mayor que la Fecha Fin",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    this.cargando = true;
    const consultas = this._monitoreoApi.tiposConBackend.map((tipo) =>
      this._monitoreoApi
        .getDocumentos(tipo, filtro, this._rutasAsignadas, this._agentes)
        .pipe(
          catchError((error: unknown) => {
            this._snotifyService.error(
              `${tipo}: ${
                error instanceof Error ? error.message : "error al consultar"
              }`,
              { position: SnotifyPosition.rightTop }
            );
            return of([] as IFilaMonitoreo[]);
          })
        )
    );
    forkJoin(consultas).subscribe((resultados) => {
      this._datos.clear();
      this._monitoreoApi.tiposConBackend.forEach((tipo, i) =>
        this._datos.set(tipo, resultados[i])
      );
      this.cargando = false;
      this.consultado = true;
      this._mostrarTab();
    });
  }

  seleccionarTab(index: number): void {
    this.tabIndex = index;
    this._mostrarTab();
  }

  private _mostrarTab(): void {
    this.resultados.data = this._datos.get(this.tabActual.tipo) ?? [];
    this.paginator?.firstPage();
  }

  cantidad(tipo: TipoDocumentoMonitor): number {
    return this._datos.get(tipo)?.length ?? 0;
  }

  esVisible(col: IColumnaMonitor): boolean {
    return this._visibles.get(this.tabActual.tipo)?.has(col.key) ?? false;
  }

  alternarColumna(col: IColumnaMonitor): void {
    const visibles = this._visibles.get(this.tabActual.tipo);
    if (!visibles) return;
    if (visibles.has(col.key)) {
      if (visibles.size > 1) visibles.delete(col.key);
    } else {
      visibles.add(col.key);
    }
  }

  applyFilter(event: Event): void {
    this.resultados.filter = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
  }

  valor(fila: IFilaMonitoreo, col: IColumnaMonitor): string {
    const v = fila[col.key];
    if (v == null || v === "") return "";
    switch (col.formato) {
      case "fecha":
        return fmtFecha(v as string);
      case "hora":
        return fmtHora(v as string);
      case "monto":
        return Number(v).toFixed(2);
      default:
        return String(v);
    }
  }

  private _filtrosTexto(): string[] {
    const f = this._filtro();
    const lineas = [
      `Fechas: ${fmtFecha(f.fechaInicio + "T00:00")} al ${fmtFecha(
        f.fechaFin + "T00:00"
      )}`,
    ];
    if (f.ruta) lineas.push(`Ruta: ${f.ruta}`);
    if (f.handheld) lineas.push(`HandHeld: ${f.handheld}`);
    if (f.agente) lineas.push(`Agente: ${f.agente}`);
    return lineas;
  }

  imprimir(): void {
    abrirReportePdf({
      titulo: `Monitoreo de Documentos — ${this.tabActual.titulo}`,
      filtros: this._filtrosTexto(),
      horizontal: true,
      secciones: [
        {
          columnas: this.columnasVisibles.map((c) => ({
            header: c.header,
            valor: (f: IFilaMonitoreo) => this.valor(f, c),
          })),
          filas: this.resultados.filteredData,
          vacio: this.tieneBackend
            ? "Sin registros para los filtros indicados."
            : "Sin datos — pendiente backend.",
        },
      ],
    });
  }

  exportarExcel(): void {
    exportarCsv(
      `monitoreo-${this.tabActual.tipo}-${hoyIso()}`,
      this.columnasVisibles.map((c) => ({
        header: c.header,
        valor: (f: IFilaMonitoreo) => this.valor(f, c),
      })),
      this.resultados.filteredData
    );
  }

  salir(): void {
    this._router.navigate([PATHS_FR_PAGES.moduloFR.withSlash]);
  }
}
