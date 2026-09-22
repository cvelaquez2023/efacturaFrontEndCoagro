import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponsePaginadaVendedorErp,
  IResponseVendedorErp,
} from "../model/agente-fr-model-interface";

const URL_VENDEDOR_ERP = environment.host + "/fr/vendedorErp";

@Injectable({
  providedIn: "root",
})
export class VendedorErpApiService {
  constructor(private _httpClient: HttpClient) {}

  /** Consulta paginada de los vendedores activos del ERP (solo lectura, no se crean ni editan aquí). */
  getVendedoresErp(
    q: string,
    page: number,
    limit: number
  ): Observable<IResponsePaginadaVendedorErp<IResponseVendedorErp[]>> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    if (q) {
      params = params.set("q", q);
    }
    return this._httpClient.get<
      IResponsePaginadaVendedorErp<IResponseVendedorErp[]>
    >(URL_VENDEDOR_ERP, { params });
  }
}
