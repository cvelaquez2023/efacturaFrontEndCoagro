import { EMPTY, Observable, forkJoin } from "rxjs";
import { expand, map, reduce } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponse,
  IResponsePaginada,
} from "@app/shared/api-models-base-interface";
import { ClienteFrApiService } from "./cliente-fr-api.service";
import {
  ICreateClienteAsocRtModel,
  IResponseClienteAsocRt,
  IResponseClienteConAsoc,
} from "../model/cliente-fr-model-interface";

const URL_CLIENTE_ASOC = environment.host + "/fr/clienteAsocRt";
const LIMIT_PAGINA = 100;

/**
 * Tabla asociada de clientes (clienteAsocRt): asocia un CLIENTE que YA existe en clienteRt a un
 * CODIGO propio del sistema de ruteo. No tiene NOMBRE (eso vive solo en clienteRt), por eso
 * getClientesConNombre() cruza ambas tablas para armar la fila que se muestra en la pantalla de Clientes.
 */
@Injectable({
  providedIn: "root",
})
export class ClienteAsocRtApiService {
  constructor(
    private _httpClient: HttpClient,
    private _clienteFrApiService: ClienteFrApiService
  ) {}

  getClientes(
    page?: number,
    limit?: number
  ): Observable<IResponsePaginada<IResponseClienteAsocRt[]>> {
    let params = new HttpParams();
    if (page != null) params = params.set("page", page);
    if (limit != null) params = params.set("limit", limit);
    return this._httpClient.get<IResponsePaginada<IResponseClienteAsocRt[]>>(
      URL_CLIENTE_ASOC,
      { params }
    );
  }

  /** Recorre todas las páginas: sin esto, cualquier cliente más allá de la página 1 (20 registros
   *  por defecto) no aparecía ni en la pantalla de Clientes ni en el buscador de Asignación de Rutas. */
  private _getAllClientes(): Observable<IResponseClienteAsocRt[]> {
    const pagina = (page: number) => this.getClientes(page, LIMIT_PAGINA);
    return pagina(1).pipe(
      expand((response) =>
        response.pagination &&
        response.pagination.page < response.pagination.totalPages
          ? pagina(response.pagination.page + 1)
          : EMPTY
      ),
      reduce(
        (acumulado: IResponseClienteAsocRt[], response) =>
          acumulado.concat(response.result || []),
        [] as IResponseClienteAsocRt[]
      )
    );
  }

  /** Lista COMPLETA de clienteAsocRt (todas las páginas) enriquecida con el NOMBRE (y demas datos)
   *  del cliente en clienteRt. */
  getClientesConNombre(): Observable<IResponse<IResponseClienteConAsoc[]>> {
    return forkJoin([
      this._getAllClientes(),
      this._clienteFrApiService.getAllClientes(),
    ]).pipe(
      map(([asoc, rt]) => {
        const porCliente = new Map(rt.map((c) => [c.CLIENTE, c]));
        const result: IResponseClienteConAsoc[] = asoc.map((a) => {
          const info = porCliente.get(a.CLIENTE);
          return {
            CLIENTE: a.CLIENTE,
            NOMBRE: info?.NOMBRE ?? "",
            LATITUD: info?.LATITUD ?? null,
            LONGITUD: info?.LONGITUD ?? null,
            ALTITUD: info?.ALTITUD ?? null,
            FECHA_ACTUALIZACION_UBICACION:
              info?.FECHA_ACTUALIZACION_UBICACION ?? null,
            CODIGO: a.CODIGO,
            BODEGA_CONSIGNA: a.BODEGA_CONSIGNA,
            LOCALIZACION_CONSIGNA: a.LOCALIZACION_CONSIGNA,
          } as IResponseClienteConAsoc;
        });
        return { result, success: true, errors: [] };
      })
    );
  }

  /** Mapa CLIENTE -> CODIGO de TODAS las asociaciones (todas las páginas). Se usa en "Cargar
   *  Clientes" para: (1) no volver a ofrecer un cliente que ya tiene ruta/día activos, y (2), si
   *  se vuelve a cargar uno que ya tenía asociación (p. ej. tras quitarlo de una ruta), reutilizar
   *  su CODIGO real en vez de asumir que es igual al CLIENTE — mismo problema que el agente
   *  VBV/AG01, ver AgenteAsocRtApiService.resolverCodigoAgente(). */
  getCodigosPorCliente(): Observable<Map<string, string>> {
    return this._getAllClientes().pipe(
      map((asociaciones) => new Map(asociaciones.map((a) => [a.CLIENTE, a.CODIGO])))
    );
  }

  createCliente(
    cliente: ICreateClienteAsocRtModel
  ): Observable<IResponse<IResponseClienteAsocRt>> {
    return this._httpClient.post<IResponse<IResponseClienteAsocRt>>(
      URL_CLIENTE_ASOC,
      cliente
    );
  }
  deleteCliente(codigo: string): Observable<IResponse<number>> {
    const url = URL_CLIENTE_ASOC + "/" + encodeURIComponent(codigo);
    return this._httpClient.delete<IResponse<number>>(url);
  }
}
