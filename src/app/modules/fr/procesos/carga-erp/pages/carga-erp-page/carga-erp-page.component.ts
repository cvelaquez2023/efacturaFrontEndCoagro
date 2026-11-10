import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { finalize } from "rxjs/operators";
import { ReportesFrApiService } from "../../../../reportes/shared/reportes-fr-api.service";
import { IPedidoReporte } from "../../../../reportes/shared/reportes-fr-model-interface";
import { fmtFecha, fmtFechaHora } from "../../../../reportes/shared/reporte-utils";
import {
  CargaFrApiService,
  COMPANIA_CARGA_DEFAULT,
} from "../../../shared/carga-fr-api.service";
import {
  IDetalleCargaErp,
  IEjecucionCarga,
  IResultadoCargaErp,
} from "../../../shared/carga-fr-model-interface";

// Carga de Datos al ERP (manual pág. 125). Real: POST /fr/carga/erp -> erpadmin.CargaAlERP,
// que pasa a CINCOH.PEDIDO los pedidos de las handhelds (alFAC_ENC_PED con DOC_PRO = 'N').
@Component({
  selector: "app-carga-erp-page",
  templateUrl: "./carga-erp-page.component.html",
  styleUrls: ["./carga-erp-page.component.scss"],
})
export class CargaErpPageComponent implements OnInit {
  compania = new FormControl(COMPANIA_CARGA_DEFAULT, Validators.required);
  companias: string[] = [COMPANIA_CARGA_DEFAULT];

  cargandoPendientes = false;
  ejecutando = false;
  pendientes = new MatTableDataSource<IPedidoReporte>([]);
  pendientesColumns = ["pedido", "fecha", "ruta", "cliente", "total"];

  resultado: IResultadoCargaErp | null = null;
  detalle = new MatTableDataSource<IDetalleCargaErp>([]);
  detalleColumns = ["pedido", "resultado", "mensaje", "fecha"];

  ejecuciones: IEjecucionCarga[] = [];
  ejecucionesColumns = ["inicio", "compania", "estado", "duracion", "mensaje"];

  readonly fmtFecha = fmtFecha;
  readonly fmtFechaHora = fmtFechaHora;

  private _todosPedidos: IPedidoReporte[] = [];

  constructor(
    private _cargaApi: CargaFrApiService,
    private _reportesApi: ReportesFrApiService,
    private _snotifyService: SnotifyService
  ) {}

  ngOnInit(): void {
    this.ejecuciones = this._cargaApi.ejecuciones("ERP");
    this.cargarPendientes();
    this.compania.valueChanges.subscribe(() => this._filtrarPendientes());
  }

  /** Pedidos de las handhelds que todavía no pasan al ERP (DOC_PRO distinto de 'S'). */
  cargarPendientes(): void {
    this.cargandoPendientes = true;
    this._reportesApi
      .getPedidos()
      .pipe(finalize(() => (this.cargandoPendientes = false)))
      .subscribe({
        next: (pedidos) => {
          this._todosPedidos = pedidos.filter(
            (p) => (p.DOC_PRO || "N").toUpperCase() !== "S"
          );
          const cias = new Set([
            COMPANIA_CARGA_DEFAULT,
            ...pedidos.map((p) => p.COD_CIA).filter((c) => !!c),
          ]);
          this.companias = Array.from(cias).sort();
          this._filtrarPendientes();
        },
        error: () => {
          this._snotifyService.error("No se pudieron consultar los pedidos pendientes", {
            position: SnotifyPosition.rightTop,
          });
        },
      });
  }

  private _filtrarPendientes(): void {
    const cia = this.compania.value as string;
    this.pendientes.data = this._todosPedidos.filter((p) => p.COD_CIA === cia);
  }

  get totalPendiente(): number {
    return this.pendientes.data.reduce((s, p) => s + (p.MON_CIV ?? 0), 0);
  }

  confirmarCarga(): void {
    if (this.compania.invalid || this.ejecutando) return;
    const n = this.pendientes.data.length;
    this._snotifyService.confirm(
      `¿Cargar al ERP ${n} pedido(s) pendiente(s) de la compañía ${this.compania.value}?`,
      {
        position: SnotifyPosition.rightTop,
        buttons: [
          {
            text: "SI",
            bold: true,
            action: (toast) => {
              this._snotifyService.remove(toast.id);
              this._ejecutar();
            },
          },
          { text: "CANCELAR" },
        ],
      }
    );
  }

  private _ejecutar(): void {
    const cia = this.compania.value as string;
    const inicio = new Date();
    this.ejecutando = true;
    this.resultado = null;
    this._cargaApi
      .cargaAlErp(cia)
      .pipe(finalize(() => (this.ejecutando = false)))
      .subscribe({
        next: (resp) => {
          const duracionSeg = (Date.now() - inicio.getTime()) / 1000;
          if (!resp.success) {
            const msg = resp.errors[0] || "Error al ejecutar la carga al ERP";
            this._registrar(inicio, duracionSeg, false, cia, msg);
            this._snotifyService.error(msg, { position: SnotifyPosition.rightTop });
            return;
          }
          this.resultado = resp.result;
          this.detalle.data = resp.result.detalle;
          const msg = `${resp.result.cargados} cargado(s), ${resp.result.conError} con error`;
          this._registrar(inicio, duracionSeg, resp.result.conError === 0, cia, msg);
          if (resp.result.conError) {
            this._snotifyService.warning(`Carga terminada: ${msg}`, {
              position: SnotifyPosition.rightTop,
            });
          } else {
            this._snotifyService.success(`Carga terminada: ${msg}`, {
              position: SnotifyPosition.rightTop,
            });
          }
          this.cargarPendientes();
        },
        error: () => {
          const msg = "No se pudo conectar con el servidor";
          this._registrar(inicio, (Date.now() - inicio.getTime()) / 1000, false, cia, msg);
          this._snotifyService.error(msg, { position: SnotifyPosition.rightTop });
        },
      });
  }

  private _registrar(
    inicio: Date,
    duracionSeg: number,
    exito: boolean,
    compania: string,
    mensaje: string
  ): void {
    this._cargaApi.registrarEjecucion({
      tipo: "ERP",
      inicio,
      duracionSeg,
      exito,
      compania,
      mensaje,
    });
    this.ejecuciones = this._cargaApi.ejecuciones("ERP");
  }
}
