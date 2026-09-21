import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponse,
  IResponsePaginada,
} from "@app/shared/api-models-base-interface";
import {
  ICreateArticuloFrModel,
  IResponseArticuloFr,
} from "../model/articulo-fr-model-interface";

const URL_ARTICULO = environment.host + "/fr/articuloRt";

@Injectable({
  providedIn: "root",
})
export class ArticuloFrApiService {
  constructor(private _httpClient: HttpClient) {}

  getArticulos(
    page?: number,
    limit?: number
  ): Observable<IResponsePaginada<IResponseArticuloFr[]>> {
    let params = new HttpParams();
    if (page != null) params = params.set("page", page);
    if (limit != null) params = params.set("limit", limit);
    return this._httpClient.get<IResponsePaginada<IResponseArticuloFr[]>>(
      URL_ARTICULO,
      { params }
    );
  }
  createArticulo(
    articulo: ICreateArticuloFrModel
  ): Observable<IResponse<IResponseArticuloFr>> {
    return this._httpClient.post<IResponse<IResponseArticuloFr>>(
      URL_ARTICULO,
      articulo
    );
  }
  updateArticulo(
    articulo: string,
    data: ICreateArticuloFrModel
  ): Observable<IResponse<number>> {
    const url = URL_ARTICULO + "/" + encodeURIComponent(articulo);
    return this._httpClient.put<IResponse<number>>(url, data);
  }
}
