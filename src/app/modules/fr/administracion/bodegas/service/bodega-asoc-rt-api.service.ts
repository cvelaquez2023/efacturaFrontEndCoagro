import { Observable, forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import { BodegaFrApiService } from "./bodega-fr-api.service";
import {
  ICreateBodegaAsocRtModel,
  IResponseBodegaAsocRt,
  IResponseBodegaConAsoc,
} from "../model/bodega-fr-model-interface";

const URL_BODEGA_ASOC = environment.host + "/fr/bodegaAsocRt";

/**
 * Tabla asociada de bodegas (bodegaAsocRt): asocia una BODEGA que YA existe en bodegaRt a un
 * CODIGO propio del sistema de ruteo. No tiene NOMBRE (eso vive solo en bodegaRt), por eso
 * getBodegasConNombre() cruza ambas tablas para armar la fila que se muestra en la pantalla de Bodegas.
 */
@Injectable({
  providedIn: "root",
})
export class BodegaAsocRtApiService {
  constructor(
    private _httpClient: HttpClient,
    private _bodegaFrApiService: BodegaFrApiService
  ) {}

  getBodegas(): Observable<IResponse<IResponseBodegaAsocRt[]>> {
    return this._httpClient.get<IResponse<IResponseBodegaAsocRt[]>>(
      URL_BODEGA_ASOC
    );
  }

  /** Lista bodegaAsocRt enriquecida con el NOMBRE (y BODEGA_ERP) de la bodega en bodegaRt. */
  getBodegasConNombre(): Observable<IResponse<IResponseBodegaConAsoc[]>> {
    return forkJoin([
      this.getBodegas(),
      this._bodegaFrApiService.getBodegas(),
    ]).pipe(
      map(([asoc, rt]) => {
        if (!asoc.success) {
          return { result: [], success: false, errors: asoc.errors };
        }
        const porBodega = new Map(
          (rt.success ? rt.result : []).map((b) => [b.BODEGA, b])
        );
        const result: IResponseBodegaConAsoc[] = asoc.result.map((a) => {
          const info = porBodega.get(a.BODEGA);
          return {
            BODEGA: a.BODEGA,
            NOMBRE: info?.NOMBRE ?? "",
            BODEGA_ERP: info?.BODEGA_ERP ?? null,
            CODIGO: a.CODIGO,
            CODIGO_BODEGA_RETABLECER: a.CODIGO_BODEGA_RETABLECER,
            PAQUETE_INVENTARIO: a.PAQUETE_INVENTARIO,
            CONSECUTIVO_CI: a.CONSECUTIVO_CI,
            LOCALIZACION: a.LOCALIZACION,
          } as IResponseBodegaConAsoc;
        });
        return { result, success: true, errors: [] };
      })
    );
  }

  createBodega(
    bodega: ICreateBodegaAsocRtModel
  ): Observable<IResponse<IResponseBodegaAsocRt>> {
    return this._httpClient.post<IResponse<IResponseBodegaAsocRt>>(
      URL_BODEGA_ASOC,
      bodega
    );
  }
  deleteBodega(bodega: string): Observable<IResponse<number>> {
    const url = URL_BODEGA_ASOC + "/" + encodeURIComponent(bodega);
    return this._httpClient.delete<IResponse<number>>(url);
  }
}
