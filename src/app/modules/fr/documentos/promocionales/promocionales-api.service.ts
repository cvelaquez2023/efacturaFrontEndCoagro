import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IResponse, IResponsePaginada } from "@app/shared/api-models-base-interface";
import { IFiltroPromocionales, IPromocional } from "./promocionales.model";

const URL_PROMOCIONAL = environment.host + "/fr/promocional";

/** Solicitudes de material promocional: GET /fr/promocional, GET /:id y PUT /:id/procesar. */
@Injectable({ providedIn: "root" })
export class PromocionalesApiService {
  constructor(private _http: HttpClient) {}

  listar(filtro: IFiltroPromocionales, page: number, limit: number): Observable<IResponsePaginada<IPromocional[]>> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    Object.entries(filtro).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== "") params = params.set(k, String(v).trim());
    });
    return this._http.get<IResponsePaginada<IPromocional[]>>(URL_PROMOCIONAL, { params });
  }

  obtener(id: number): Observable<IResponse<IPromocional>> {
    return this._http.get<IResponse<IPromocional>>(`${URL_PROMOCIONAL}/${id}`);
  }

  /** docPro "S" = procesado (guarda quién y cuándo); "N" = reabrir. */
  procesar(id: number, docPro: "S" | "N"): Observable<IResponse<IPromocional>> {
    return this._http.put<IResponse<IPromocional>>(`${URL_PROMOCIONAL}/${id}/procesar`, { docPro });
  }
}
