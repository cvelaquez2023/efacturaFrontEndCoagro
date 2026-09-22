import { EMPTY, Observable } from "rxjs";
import { expand, reduce } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponse,
  IResponsePaginada,
} from "@app/shared/api-models-base-interface";
import {
  ICreateRutaClienteModel,
  IResponseRutaCliente,
} from "../model/asignacion-ruta-model-interface";

const URL_RUTA_CLIENTE = environment.host + "/fr/rutaCliente";
const LIMIT_PAGINA = 100;

export interface IFiltroRutaCliente {
  ruta?: string;
  cliente?: string;
  dia?: number;
  page?: number;
  limit?: number;
}

/**
 * Tabla nativa del ERP RUTA_CLIENTE (PK compuesta RUTA+CLIENTE+DIA): asigna el dia de visita de
 * un cliente en una ruta. El backend rechaza el POST si el cliente ya tiene un dia asignado en
 * esa misma ruta ("El cliente X ya esta asignado a la ruta Y en el dia Z..."), pero permite que
 * el mismo cliente tenga un dia distinto en cada ruta.
 */
@Injectable({
  providedIn: "root",
})
export class RutaClienteApiService {
  constructor(private _httpClient: HttpClient) {}

  getRutaCliente(
    filtro: IFiltroRutaCliente = {}
  ): Observable<IResponsePaginada<IResponseRutaCliente[]>> {
    let params = new HttpParams();
    if (filtro.ruta) params = params.set("ruta", filtro.ruta);
    if (filtro.cliente) params = params.set("cliente", filtro.cliente);
    if (filtro.dia != null) params = params.set("dia", filtro.dia);
    if (filtro.page != null) params = params.set("page", filtro.page);
    if (filtro.limit != null) params = params.set("limit", filtro.limit);
    return this._httpClient.get<IResponsePaginada<IResponseRutaCliente[]>>(
      URL_RUTA_CLIENTE,
      { params }
    );
  }

  createRutaCliente(
    data: ICreateRutaClienteModel
  ): Observable<IResponse<IResponseRutaCliente>> {
    return this._httpClient.post<IResponse<IResponseRutaCliente>>(
      URL_RUTA_CLIENTE,
      data
    );
  }

  deleteRutaCliente(
    ruta: string,
    cliente: string,
    dia: number
  ): Observable<IResponse<number>> {
    const url = `${URL_RUTA_CLIENTE}/${encodeURIComponent(
      ruta
    )}/${encodeURIComponent(cliente)}/${dia}`;
    return this._httpClient.delete<IResponse<number>>(url);
  }

  /** Cambia el ORDEN (prioridad de entrega) de un cliente ya asignado a ese día. */
  updateRutaCliente(
    ruta: string,
    cliente: string,
    dia: number,
    orden: number
  ): Observable<IResponse<number>> {
    const url = `${URL_RUTA_CLIENTE}/${encodeURIComponent(
      ruta
    )}/${encodeURIComponent(cliente)}/${dia}`;
    return this._httpClient.put<IResponse<number>>(url, { orden });
  }

  /** Recorre todas las páginas para traer, en un solo arreglo, todos los clientes-día de una ruta. */
  getAllRutaCliente(ruta: string): Observable<IResponseRutaCliente[]> {
    const pagina = (page: number) =>
      this.getRutaCliente({ ruta, page, limit: LIMIT_PAGINA });
    return pagina(1).pipe(
      expand((response) =>
        response.pagination &&
        response.pagination.page < response.pagination.totalPages
          ? pagina(response.pagination.page + 1)
          : EMPTY
      ),
      reduce(
        (acumulado: IResponseRutaCliente[], response) =>
          acumulado.concat(response.result || []),
        [] as IResponseRutaCliente[]
      )
    );
  }
}
