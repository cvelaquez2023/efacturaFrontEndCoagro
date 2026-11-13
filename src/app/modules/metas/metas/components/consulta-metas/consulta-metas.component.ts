import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { MetasApiService, mensajeErrorHttp } from "../../../metas-shared/metas-api.service";
import { conTildes, IConsultaMetas, MESES, nombreMes, primerError } from "../../../metas-shared/metas.model";

export interface IConsultaMetasData {
  anio?: number | null;
  mes?: number | null;
}

type PeriodoCargado = IConsultaMetas["periodosCargados"][number];

/**
 * «Consulta» de la carga de metas (GET /fr/metaVentaProducto/consulta): periodos ya cargados
 * (con opción de borrar un periodo completo), códigos válidos y formato/reglas de la plantilla.
 */
@Component({
  selector: "app-consulta-metas",
  templateUrl: "./consulta-metas.component.html",
  styleUrls: ["./consulta-metas.component.scss"],
})
export class ConsultaMetasComponent implements OnInit {
  readonly meses = MESES;
  readonly nombreMes = nombreMes;
  readonly texto = conTildes;

  anio: number | null;
  mes: number | null;
  datos: IConsultaMetas | null = null;
  cargando = false;
  /** Se borró algún periodo: al cerrar, la pantalla de Metas se refresca. */
  private _huboCambios = false;

  constructor(
    private _api: MetasApiService,
    private _snotify: SnotifyService,
    private _ref: MatDialogRef<ConsultaMetasComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) data: IConsultaMetasData
  ) {
    this.anio = data?.anio ?? new Date().getFullYear();
    this.mes = data?.mes ?? null;
  }

  ngOnInit(): void {
    this.consultar();
  }

  consultar(): void {
    this.cargando = true;
    this._api.consultaMetas(this.anio, this.mes).subscribe({
      next: (r) => {
        this.cargando = false;
        if (!r.success) {
          this._error(primerError(r.errors, "No se pudo consultar"));
          return;
        }
        this.datos = r.result;
      },
      error: (e) => {
        this.cargando = false;
        this._error(mensajeErrorHttp(e));
      },
    });
  }

  get totalMetas(): number {
    return (this.datos?.periodosCargados ?? []).reduce((t, p) => t + Number(p.articulos || 0), 0);
  }

  /** Borra todas las metas de un vendedor en ese año/mes (DELETE /periodo). */
  eliminarPeriodo(p: PeriodoCargado): void {
    const nombre = p.vendedorNombre ? `${p.Vendedor} · ${p.vendedorNombre}` : p.Vendedor;
    this._snotify.confirm(
      `¿Eliminar las ${p.articulos} meta(s) de ${nombre} en ${nombreMes(p.Mes)} ${p.Anio}? No se puede deshacer.`,
      {
        position: SnotifyPosition.rightTop,
        timeout: 0,
        buttons: [
          {
            text: "SI, ELIMINAR",
            bold: true,
            action: (toast) => {
              this._snotify.remove(toast.id);
              this._api.eliminarPeriodo(p.Anio, p.Mes, p.Vendedor).subscribe({
                next: (r) => {
                  if (!r.success) {
                    this._error(primerError(r.errors, "No se pudo eliminar el periodo"));
                    return;
                  }
                  this._huboCambios = true;
                  this._snotify.success(`Se eliminaron ${r.result?.eliminadas ?? p.articulos} meta(s)`, {
                    position: SnotifyPosition.rightTop,
                  });
                  this.consultar();
                },
                error: (e) => this._error(mensajeErrorHttp(e)),
              });
            },
          },
          { text: "CANCELAR" },
        ],
      }
    );
  }

  cerrar(): void {
    this._ref.close(this._huboCambios);
  }

  private _error(mensaje: string): void {
    this._snotify.error(conTildes(mensaje), { position: SnotifyPosition.rightTop, timeout: 8000 });
  }
}
