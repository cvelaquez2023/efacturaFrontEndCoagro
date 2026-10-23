import { EMPTY, forkJoin, Observable, of } from "rxjs";
import { expand, map, reduce } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponsePaginada } from "@app/shared/api-models-base-interface";
import { IResponseHandheld } from "../../administracion/handhelds/model/handheld-fr-model-interface";
import { IResponseVendedorErp } from "../../administracion/agentes/model/agente-fr-model-interface";
import { IResponseRutaCliente } from "../../rutas/asignacion-rutas/model/asignacion-ruta-model-interface";
import {
  IAgenteReporte,
  IFiltroReporteVisita,
  IPedidoReporte,
  IReporteVisita,
  IResumenVisita,
  IRutaAsignadaReporte,
} from "./reportes-fr-model-interface";

const URL_REPORTE_VISITA = environment.host + "/fr/reporteVisita";
const URL_RESUMEN_VISITA = environment.host + "/fr/reporteVisita/resumen";
/** Pedidos de las handhelds (erpadmin.alFAC_ENC_PED), controllers/fr/pedido.js. */
const URL_PEDIDOS = environment.host + "/fr/pedido";
const URL_RUTA_ASIGNADA = environment.host + "/fr/rutaAsignadaRt";
const URL_RUTA_CLIENTE = environment.host + "/fr/rutaCliente";
const URL_HANDHELD = environment.host + "/fr/handheldRt";
const URL_AGENTE_ASOC = environment.host + "/fr/agenteAsocRt";
const URL_VENDEDOR_ERP = environment.host + "/fr/vendedorErp";

/** Máximo que acepta el backend por página (utils/paginacion.js). */
const LIMIT_PAGINA = 100;

interface IAgenteAsocRaw {
  AGENTE: string;
  CODIGO: string;
}

/**
 * Datos reales para los reportes de FR (Reportes y Monitoreo de Documentos). Todos los GET del
 * backend paginan (20 por defecto, 100 máximo): aquí se recorren las páginas para que cada
 * pantalla reciba la lista completa (o hasta `top` registros), y se filtra del lado del cliente
 * lo que el backend no soporta (rangos Desde/Hasta de rutas, clientes, agentes, razones).
 */
@Injectable({
  providedIn: "root",
})
export class ReportesFrApiService {
  /** Si es false no se llama a URL_PEDIDOS y los reportes muestran la columna de pedido vacía
   *  (con un aviso). GET paginado con filtros ruta/cliente/desde/hasta sobre FEC_PED. */
  static readonly PEDIDOS_BACKEND_DISPONIBLE: boolean = true;

  constructor(private _httpClient: HttpClient) {}

  /** Recorre las páginas de un GET paginado hasta agotar el total o llegar a `top` filas. */
  private _todasLasPaginas<T>(
    url: string,
    params: HttpParams = new HttpParams(),
    top = Number.MAX_SAFE_INTEGER
  ): Observable<T[]> {
    const pagina = (page: number) =>
      this._httpClient.get<IResponsePaginada<T[]>>(url, {
        params: params.set("page", page).set("limit", LIMIT_PAGINA),
      });
    return pagina(1).pipe(
      expand((response) => {
        if (!response.success) return EMPTY;
        const p = response.pagination;
        return p && p.page < p.totalPages && p.page * LIMIT_PAGINA < top
          ? pagina(p.page + 1)
          : EMPTY;
      }),
      reduce((acumulado: T[], response) => {
        if (!response.success) {
          throw new Error(
            response.errors?.join(", ") || "Error al consultar el reporte"
          );
        }
        return acumulado.concat(response.result || []);
      }, [] as T[]),
      map((filas) => filas.slice(0, top))
    );
  }

  private _paramsVisita(filtro: IFiltroReporteVisita): HttpParams {
    let params = new HttpParams();
    (Object.keys(filtro) as (keyof IFiltroReporteVisita)[]).forEach((k) => {
      const valor = filtro[k];
      if (valor) params = params.set(k, valor);
    });
    return params;
  }

  /** GET /fr/reporteVisita: una fila por visita, ordenadas de la más reciente a la más vieja. */
  getVisitas(
    filtro: IFiltroReporteVisita = {},
    top?: number
  ): Observable<IReporteVisita[]> {
    return this._todasLasPaginas<IReporteVisita>(
      URL_REPORTE_VISITA,
      this._paramsVisita(filtro),
      top
    );
  }

  /** GET /fr/reporteVisita/resumen: una fila por ruta y día. */
  getResumenVisitas(
    filtro: IFiltroReporteVisita = {},
    top?: number
  ): Observable<IResumenVisita[]> {
    return this._todasLasPaginas<IResumenVisita>(
      URL_RESUMEN_VISITA,
      this._paramsVisita(filtro),
      top
    );
  }

  /** Pedidos de las handhelds (alFAC_ENC_PED). Lista vacía mientras no exista el endpoint. */
  getPedidos(
    filtro: IFiltroReporteVisita = {},
    top?: number
  ): Observable<IPedidoReporte[]> {
    if (!ReportesFrApiService.PEDIDOS_BACKEND_DISPONIBLE) return of([]);
    return this._todasLasPaginas<IPedidoReporte>(
      URL_PEDIDOS,
      this._paramsVisita(filtro),
      top
    );
  }

  /** Todas las cabeceras de RUTA_ASIGNADA_RT (agente y handheld de cada ruta). */
  getRutasAsignadas(): Observable<IRutaAsignadaReporte[]> {
    return this._todasLasPaginas<IRutaAsignadaReporte>(URL_RUTA_ASIGNADA);
  }

  /** Todo RUTA_CLIENTE (ruta, cliente, día 1=Lunes..7=Domingo, orden). */
  getRutaClientes(): Observable<IResponseRutaCliente[]> {
    return this._todasLasPaginas<IResponseRutaCliente>(URL_RUTA_CLIENTE);
  }

  getHandhelds(): Observable<IResponseHandheld[]> {
    return this._todasLasPaginas<IResponseHandheld>(URL_HANDHELD);
  }

  /** Agentes de ruteo (AGENTE_ASOC_RT) con el nombre del vendedor del ERP asociado. */
  getAgentes(): Observable<IAgenteReporte[]> {
    return forkJoin([
      this._todasLasPaginas<IAgenteAsocRaw>(URL_AGENTE_ASOC),
      this._todasLasPaginas<IResponseVendedorErp>(URL_VENDEDOR_ERP),
    ]).pipe(
      map(([asociaciones, vendedores]) => {
        const nombreVendedor = new Map(
          vendedores.map((v) => [String(v.VENDEDOR).trim(), v.NOMBRE])
        );
        return asociaciones.map((a) => ({
          codigo: String(a.CODIGO).trim(),
          vendedor: String(a.AGENTE).trim(),
          nombre: nombreVendedor.get(String(a.AGENTE).trim()) ?? "",
        }));
      })
    );
  }
}

/** Error legible de un observable de reportes (Error propio o HttpErrorResponse). */
export const mensajeError = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;
  return "Error al consultar el reporte";
};
