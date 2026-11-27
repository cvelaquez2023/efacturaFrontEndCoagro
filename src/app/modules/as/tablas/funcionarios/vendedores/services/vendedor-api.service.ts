import { IResponse } from "./../../../../../../shared/api-models-base-interface";
import { Observable } from "rxjs";
import { HttpClient, HttpContext, HttpParams } from "@angular/common/http";
import { SIN_CARGADOR } from "@app/interceptors/error-api.interceptor";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponseVendedor,
  IRequestCreateVendedor,
  IResponseProveedor,
  IProveedorBusqueda,
} from "./vendedor-api-model-interface";
import { url } from "inspector";

const URL_VENDEDOR = environment.host + "/AS/Vendedor";
const URL_PROVEEDOR = environment.host + "/proveedor";
@Injectable({
  providedIn: "root",
})
export class VendedorApiService {
  constructor(private _httpClient: HttpClient) {}
  getVendedor(
    page?: number,
    rows?: number
  ): Observable<IResponse<IResponseVendedor[]>> {
    let url = URL_VENDEDOR;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    url = url + "?page=" + page + "&rows=" + rows;
    return this._httpClient.get<IResponse<IResponseVendedor[]>>(url);
  }
  getproveedor(contri: string): Observable<IResponse<IResponseProveedor[]>> {
    const url = URL_PROVEEDOR + "/" + encodeURIComponent(contri);
    return this._httpClient.get<IResponse<IResponseProveedor[]>>(url);
  }
  /** Proveedores del ERP por código, nombre, alias o contribuyente (GET /proveedor?q=). */
  buscarProveedores(texto: string, limite = 30): Observable<IResponse<IProveedorBusqueda[]>> {
    const params = new HttpParams().set("q", texto.trim()).set("limit", limite);
    // Búsqueda mientras se escribe: sin el cargador de pantalla completa.
    const context = new HttpContext().set(SIN_CARGADOR, true);
    return this._httpClient.get<IResponse<IProveedorBusqueda[]>>(URL_PROVEEDOR, { params, context });
  }
  createVendedor(
    vendedor: IRequestCreateVendedor
  ): Observable<IResponse<number>> {
    return this._httpClient.post<IResponse<number>>(URL_VENDEDOR, vendedor);
  }
  delete(idVendedor: number): Observable<IResponse<number>> {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const url = URL_VENDEDOR + "/" + idVendedor;
    return this._httpClient.delete<IResponse<number>>(url);
  }
  update(
    idVendedor: number,
    vendedor: IRequestCreateVendedor
  ): Observable<IResponse<number>> {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const url = URL_VENDEDOR + "/" + idVendedor;
    return this._httpClient.put<IResponse<number>>(url, vendedor);
  }
}
