import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { CobrosApiService } from "../../cobros-api.service";
import { formaDePago, ILineaRecibo, IRecibo } from "../../cobros.model";
import { abrirPdfCobro } from "../../pdf-cobro";

/** Detalle de un recibo de cobro: encabezado y documentos pagados (GET /fr/deposito/:consecDep). */
@Component({
  selector: "app-recibo-dialog",
  templateUrl: "./recibo-dialog.component.html",
  styleUrls: ["./recibo-dialog.component.scss"],
})
export class ReciboDialogComponent implements OnInit {
  readonly formaDePago = formaDePago;
  recibo: IRecibo | null = null;
  cargando = true;
  abriendoPdf = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { consecDep: number },
    private _api: CobrosApiService,
    private _snotify: SnotifyService
  ) {}

  ngOnInit(): void {
    this._api.recibo(this.data.consecDep).subscribe({
      next: (r) => {
        this.cargando = false;
        if (!r.success) {
          this._snotify.error((r.errors || []).join(", ") || "No se pudo consultar el recibo", { position: SnotifyPosition.rightTop });
          return;
        }
        this.recibo = r.result;
      },
      error: () => {
        this.cargando = false;
        this._snotify.error("No se pudo consultar el recibo", { position: SnotifyPosition.rightTop });
      },
    });
  }

  totalLinea(l: ILineaRecibo): number {
    return Number(l.MON_EFE) + Number(l.MON_CHE) + Number(l.MON_DEP) + Number(l.MON_TRA);
  }

  get total(): number {
    const r = this.recibo;
    return r ? Number(r.TOTAL_EFE) + Number(r.TOTAL_CHE) + Number(r.TOTAL_DEP) + Number(r.TOTAL_TRA) : 0;
  }

  pdf(numDoc?: string): void {
    if (!this.recibo) return;
    this.abriendoPdf = true;
    abrirPdfCobro(this._api, this._snotify, this.recibo.CONSEC_DEP, numDoc, () => (this.abriendoPdf = false));
  }
}
