import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponseArticuloErp,
  IResponsePaginadaArticuloErp,
} from "../model/articulo-erp-fr-model-interface";

const URL_ARTICULO_ERP = environment.host + "/fr/articuloErp";

@Injectable({
  providedIn: "root",
})
export class ArticuloErpApiService {
  constructor(private _httpClient: HttpClient) {}

  /** Consulta paginada de los articulos ya existentes en el ERP (solo lectura, no se crean aqui). */
  getArticulosErp(
    q: string,
    page: number,
    limit: number
  ): Observable<IResponsePaginadaArticuloErp<IResponseArticuloErp[]>> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    if (q) {
      params = params.set("q", q);
    }
    return this._httpClient.get<
      IResponsePaginadaArticuloErp<IResponseArticuloErp[]>
    >(URL_ARTICULO_ERP, { params });
  }
}
