import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IResponse, IResponsePaginada } from "@app/shared/api-models-base-interface";
import { IDocumentoPagado, IFiltroCobros, IRecibo, ITotalesCobro } from "./cobros.model";

const URL_DEPOSITO = environment.host + "/fr/deposito";

/** Consulta de cobros (recibos/depósitos de la handheld): GET /fr/deposito… (solo lectura). */
@Injectable({ providedIn: "root" })
export class CobrosApiService {
  constructor(private _http: HttpClient) {}

  private _params(filtro: IFiltroCobros, page: number, limit: number): HttpParams {
    let p = new HttpParams().set("page", page).set("limit", limit);
    Object.entries(filtro).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== "") p = p.set(k, String(v).trim());
    });
    return p;
  }

  /** Un documento pagado por fila, con su recibo; `totales` de todo lo filtrado. */
  documentos(
    filtro: IFiltroCobros,
    page: number,
    limit: number
  ): Observable<IResponsePaginada<IDocumentoPagado[]> & { totales?: ITotalesCobro }> {
    return this._http.get<IResponsePaginada<IDocumentoPagado[]> & { totales?: ITotalesCobro }>(`${URL_DEPOSITO}/documentos`, {
      params: this._params(filtro, page, limit),
    });
  }

  recibos(filtro: IFiltroCobros, page: number, limit: number): Observable<IResponsePaginada<IRecibo[]>> {
    const { numDoc: _n, cliente: _c, ruta: _r, ...soloRecibo } = filtro;
    return this._http.get<IResponsePaginada<IRecibo[]>>(URL_DEPOSITO, { params: this._params(soloRecibo, page, limit) });
  }

  recibo(consecDep: number): Observable<IResponse<IRecibo>> {
    return this._http.get<IResponse<IRecibo>>(`${URL_DEPOSITO}/${consecDep}`);
  }

  /** PDF del recibo (mismo formato que imprime la app). Con numDoc, solo la página de ese documento. */
  pdf(consecDep: number, numDoc?: string | null): Observable<Blob> {
    let params = new HttpParams();
    if (numDoc) params = params.set("numDoc", numDoc);
    return this._http.get(`${URL_DEPOSITO}/${consecDep}/pdf`, { params, responseType: "blob" });
  }
}
