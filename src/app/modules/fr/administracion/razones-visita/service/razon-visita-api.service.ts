import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import {
  ICreateRazonVisitaModel,
  IResponseRazonVisita,
} from "../model/razon-visita-api-model-interface";

const URL_RAZON_VISITA = environment.host + "/fr/efectividadVisita";

@Injectable({
  providedIn: "root",
})
export class RazonVisitaApiService {
  constructor(private _httpClient: HttpClient) {}

  getRazonVisita(): Observable<IResponse<IResponseRazonVisita[]>> {
    return this._httpClient.get<IResponse<IResponseRazonVisita[]>>(
      URL_RAZON_VISITA
    );
  }
  createRazonVisita(
    razonVisita: ICreateRazonVisitaModel
  ): Observable<IResponse<number>> {
    return this._httpClient.post<IResponse<number>>(
      URL_RAZON_VISITA,
      razonVisita
    );
  }
  deleteRazonVisita(efectVisita: string): Observable<IResponse<number>> {
    const url = URL_RAZON_VISITA + "/" + encodeURIComponent(efectVisita);
    return this._httpClient.delete<IResponse<number>>(url);
  }
  updateRazonVisita(
    efectVisita: string,
    data: ICreateRazonVisitaModel
  ): Observable<IResponse<number>> {
    const url = URL_RAZON_VISITA + "/" + encodeURIComponent(efectVisita);
    return this._httpClient.put<IResponse<number>>(url, data);
  }
}
