import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { finalize } from "rxjs/operators";
import { ReportesFrApiService } from "../../../../reportes/shared/reportes-fr-api.service";
import { CobrosApiService } from "../../cobros-api.service";
import { formaDePago, IDocumentoPagado, IFiltroCobros, IRecibo, ITotalesCobro } from "../../cobros.model";
import { abrirPdfCobro } from "../../pdf-cobro";
import { ReciboDialogComponent } from "../../components/recibo-dialog/recibo-dialog.component";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * FR → Documentos → Cobros: lo que cobran los vendedores con la handheld (recibos/depósitos).
 * Pestaña "Documentos pagados" (un documento por fila, con totales por forma de pago) y pestaña
 * "Recibos" (un recibo por fila). Detalle del recibo y PDF con el mismo formato que la app.
 */
@Component({
  selector: "app-cobros-page",
  templateUrl: "./cobros-page.component.html",
  styleUrls: ["./cobros-page.component.scss"],
})
export class CobrosPageComponent implements OnInit {
  readonly formaDePago = formaDePago;

  filtro: IFiltroCobros = {};
  tab = 0;
  rutas: string[] = [];
  handhelds: string[] = [];

  // Documentos pagados
  documentos: IDocumentoPagado[] = [];
  totales: ITotalesCobro | null = null;
  totalDocumentos = 0;
  pageDoc = 1;
  limitDoc = 20;

  // Recibos
  recibos: IRecibo[] = [];
  totalRecibos = 0;
  pageRec = 1;
  limitRec = 20;

  cargando = false;
  pdfAbriendo: number | null = null;

  constructor(
    private _api: CobrosApiService,
    private _reportes: ReportesFrApiService,
    private _dialog: MatDialog,
    private _snotify: SnotifyService
  ) {}

  ngOnInit(): void {
    this._filtroInicial();
    this._reportes.getRutasAsignadas().subscribe({
      next: (lista) => {
        this.rutas = [...new Set(lista.map((r) => String(r.RUTA).trim()))].sort();
        this.handhelds = [...new Set(lista.map((r) => String(r.HANDHELD ?? "").trim()).filter(Boolean))].sort();
      },
      error: () => undefined,
    });
    this.buscar();
  }

  private _filtroInicial(): void {
    const hoy = new Date();
    this.filtro = { desde: iso(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: iso(hoy) };
  }

  buscar(): void {
    this.pageDoc = 1;
    this.pageRec = 1;
    this.cargarDocumentos();
    this.cargarRecibos();
  }

  limpiar(): void {
    this._filtroInicial();
    this.buscar();
  }

  cargarDocumentos(): void {
    this.cargando = true;
    this._api
      .documentos(this.filtro, this.pageDoc, this.limitDoc)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (r) => {
          if (!r.success) {
            this._error((r.errors || [])[0] || "No se pudieron consultar los cobros");
            return;
          }
          this.documentos = r.result || [];
          this.totalDocumentos = r.pagination?.total ?? this.documentos.length;
          this.totales = r.totales ?? null;
        },
        error: () => this._error("No se pudieron consultar los cobros"),
      });
  }

  cargarRecibos(): void {
    this._api.recibos(this.filtro, this.pageRec, this.limitRec).subscribe({
      next: (r) => {
        if (!r.success) {
          this._error((r.errors || [])[0] || "No se pudieron consultar los recibos");
          return;
        }
        this.recibos = r.result || [];
        this.totalRecibos = r.pagination?.total ?? this.recibos.length;
      },
      error: () => this._error("No se pudieron consultar los recibos"),
    });
  }

  paginaDocumentos(e: PageEvent): void {
    this.pageDoc = e.pageIndex + 1;
    this.limitDoc = e.pageSize;
    this.cargarDocumentos();
  }

  paginaRecibos(e: PageEvent): void {
    this.pageRec = e.pageIndex + 1;
    this.limitRec = e.pageSize;
    this.cargarRecibos();
  }

  verRecibo(consecDep: number): void {
    this._dialog.open(ReciboDialogComponent, { width: "960px", maxWidth: "96vw", data: { consecDep } });
  }

  pdf(consecDep: number, numDoc?: string): void {
    this.pdfAbriendo = consecDep;
    abrirPdfCobro(this._api, this._snotify, consecDep, numDoc, () => (this.pdfAbriendo = null));
  }

  totalRecibo(r: IRecibo): number {
    return Number(r.TOTAL_EFE) + Number(r.TOTAL_CHE) + Number(r.TOTAL_DEP) + Number(r.TOTAL_TRA);
  }

  private _error(m: string): void {
    this._snotify.error(m, { position: SnotifyPosition.rightTop, timeout: 8000 });
  }
}
