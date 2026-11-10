import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient, HttpContext } from "@angular/common/http";
import { TIEMPO_ESPERA_HTTP } from "@app/interceptors/error-api.interceptor";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import {
  IDetalleCargaErp,
  IEjecucionCarga,
  IResultadoCargaErp,
  IResumenCargaErp,
} from "./carga-fr-model-interface";

// Backend: routes/fr/carga.js -> controllers/fr/carga.js (solo ejecutan procedimientos).
const URL_CARGA_ERP = environment.host + "/fr/carga/erp"; // EXEC erpadmin.CargaAlERP @COD_CIA
const URL_CARGA_MOVIL = environment.host + "/fr/carga/movil"; // EXEC erpadmin.CargaAlMovil

/** Las cargas ejecutan procedimientos largos: se espera hasta 10 minutos (el normal es 20 s). */
const ESPERA_CARGA_MS = 10 * 60 * 1000;
const contextoCarga = (): HttpContext =>
  new HttpContext().set(TIEMPO_ESPERA_HTTP, ESPERA_CARGA_MS);

/** Compañía por defecto del procedimiento CargaAlERP. */
export const COMPANIA_CARGA_DEFAULT = "CINCOH";

@Injectable({
  providedIn: "root",
})
export class CargaFrApiService {
  /** Ejecuciones hechas en esta sesión (no existe endpoint de bitácora todavía). */
  private _ejecuciones: IEjecucionCarga[] = [];

  constructor(private _httpClient: HttpClient) {}

  /** Pasa al ERP (CINCOH.PEDIDO) los pedidos de las handhelds con DOC_PRO = 'N'.
   *  El procedimiento devuelve dos SELECT que llegan juntos en `result`: el resumen
   *  (PEDIDOS_CARGADOS / PEDIDOS_CON_ERROR) y una fila por pedido procesado. */
  cargaAlErp(codCia: string): Observable<IResponse<IResultadoCargaErp>> {
    return this._httpClient
      .post<IResponse<unknown[]>>(
        URL_CARGA_ERP,
        { COD_CIA: codCia },
        { context: contextoCarga() }
      )
      .pipe(
        map((resp) => {
          const filas = Array.isArray(resp.result) ? resp.result : [];
          const resumen = filas.find(
            (f): f is IResumenCargaErp =>
              !!f && typeof f === "object" && "PEDIDOS_CARGADOS" in f
          );
          const detalle = filas.filter(
            (f): f is IDetalleCargaErp =>
              !!f && typeof f === "object" && "NUM_PED" in f
          );
          return {
            success: resp.success,
            errors: resp.errors ?? [],
            result: {
              cargados:
                resumen?.PEDIDOS_CARGADOS ??
                detalle.filter((d) => d.RESULTADO === "OK").length,
              conError:
                resumen?.PEDIDOS_CON_ERROR ??
                detalle.filter((d) => d.RESULTADO !== "OK").length,
              detalle,
            },
          };
        })
      );
  }

  /** Prepara las tablas que bajan las handhelds (visitas, clientes, artículos, existencias,
   *  precios, pendientes de cobro...). No recibe parámetros ni devuelve datos. */
  cargaAlMovil(): Observable<IResponse<unknown>> {
    return this._httpClient.post<IResponse<unknown>>(
      URL_CARGA_MOVIL,
      {},
      { context: contextoCarga() }
    );
  }

  registrarEjecucion(ejecucion: IEjecucionCarga): void {
    this._ejecuciones = [ejecucion, ...this._ejecuciones].slice(0, 50);
  }

  ejecuciones(tipo: IEjecucionCarga["tipo"]): IEjecucionCarga[] {
    return this._ejecuciones.filter((e) => e.tipo === tipo);
  }
}
