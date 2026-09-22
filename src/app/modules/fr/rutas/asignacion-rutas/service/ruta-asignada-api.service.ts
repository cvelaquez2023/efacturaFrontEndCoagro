import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import {
  ICreateRutaAsignadaModel,
  IResponseRutaAsignada,
} from "../model/asignacion-ruta-model-interface";

const URL_RUTA_ASIGNADA = environment.host + "/fr/rutaAsignadaRt";

/**
 * Cabecera de Asignación de Ruta (agente, handheld, grupo artículo y bodega asignados a una
 * ruta ya existente en rutaRt). Relación 1:1: cada ruta tiene a lo sumo una fila (PK = RUTA).
 */
@Injectable({
  providedIn: "root",
})
export class RutaAsignadaApiService {
  constructor(private _httpClient: HttpClient) {}

  getRutasAsignadas(): Observable<IResponse<IResponseRutaAsignada[]>> {
    return this._httpClient.get<IResponse<IResponseRutaAsignada[]>>(
      URL_RUTA_ASIGNADA
    );
  }
  createRutaAsignada(
    data: ICreateRutaAsignadaModel
  ): Observable<IResponse<IResponseRutaAsignada>> {
    return this._httpClient.post<IResponse<IResponseRutaAsignada>>(
      URL_RUTA_ASIGNADA,
      data
    );
  }
  updateRutaAsignada(
    ruta: string,
    data: Omit<ICreateRutaAsignadaModel, "ruta">
  ): Observable<IResponse<number>> {
    const url = URL_RUTA_ASIGNADA + "/" + encodeURIComponent(ruta);
    return this._httpClient.put<IResponse<number>>(url, data);
  }
  deleteRutaAsignada(ruta: string): Observable<IResponse<number>> {
    const url = URL_RUTA_ASIGNADA + "/" + encodeURIComponent(ruta);
    return this._httpClient.delete<IResponse<number>>(url);
  }
}
