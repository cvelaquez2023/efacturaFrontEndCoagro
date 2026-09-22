import { EMPTY, Observable, of } from "rxjs";
import { catchError, expand, map, reduce, switchMap } from "rxjs/operators";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  IResponse,
  IResponsePaginada,
} from "@app/shared/api-models-base-interface";

const URL_AGENTE_RT = environment.host + "/fr/agenteRt";
const URL_AGENTE_ASOC = environment.host + "/fr/agenteAsocRt";
const LIMIT_PAGINA = 100;

interface IAgenteAsocRtRaw {
  AGENTE: string;
  CODIGO: string;
  COMPANIA: string | null;
  TIPO: string;
}

/**
 * El picker de Agente en Asignación de Rutas lista el catálogo real de vendedores del ERP
 * (VendedorErpApiService) — los vendedores ya existen, aquí no se crea ninguno. Pero
 * RUTA_ASIGNADA_RT.AGENTE valida contra AGENTE_ASOC_RT.CODIGO, no contra el VENDEDOR crudo del
 * ERP (ver AgenteAsocRt.js / RutaAsignadaRt.js en el backend). resolverCodigoAgente() traduce de
 * forma transparente lo elegido (código de vendedor recién seleccionado, o un CODIGO de ruteo ya
 * guardado si no se tocó el picker al editar) al CODIGO de ruteo real, vinculando la asociación
 * la primera vez que hace falta con el mismo código del vendedor — sin ningún flujo de "crear
 * agente" visible para el usuario.
 */
@Injectable({
  providedIn: "root",
})
export class AgenteAsocRtApiService {
  constructor(private _httpClient: HttpClient) {}

  private _getAsociaciones(
    page?: number,
    limit?: number
  ): Observable<IResponsePaginada<IAgenteAsocRtRaw[]>> {
    let params = new HttpParams();
    if (page != null) params = params.set("page", page);
    if (limit != null) params = params.set("limit", limit);
    return this._httpClient.get<IResponsePaginada<IAgenteAsocRtRaw[]>>(
      URL_AGENTE_ASOC,
      { params }
    );
  }

  /** Recorre todas las páginas de agenteAsocRt (por defecto solo trae 20 registros). */
  private _getTodasLasAsociaciones(): Observable<IAgenteAsocRtRaw[]> {
    const pagina = (page: number) => this._getAsociaciones(page, LIMIT_PAGINA);
    return pagina(1).pipe(
      expand((response) =>
        response.success &&
        response.pagination.page < response.pagination.totalPages
          ? pagina(response.pagination.page + 1)
          : EMPTY
      ),
      reduce(
        (acumulado: IAgenteAsocRtRaw[], response) =>
          acumulado.concat(response.success ? response.result : []),
        [] as IAgenteAsocRtRaw[]
      )
    );
  }

  /** Devuelve el CODIGO de ruteo real para `valor`: puede venir del picker como el código del
   *  vendedor recién elegido, o sin cambios desde una edición como un CODIGO ya guardado. Si el
   *  vendedor aún no tiene asociación, la crea usando su propio código como CODIGO de ruteo. */
  resolverCodigoAgente(valor: string): Observable<IResponse<string>> {
    return this._getTodasLasAsociaciones().pipe(
      switchMap((asociaciones) => {
        const porCodigo = asociaciones.find((a) => a.CODIGO === valor);
        if (porCodigo) {
          return of({ success: true, result: porCodigo.CODIGO, errors: [] });
        }
        const porAgente = asociaciones.find((a) => a.AGENTE === valor);
        if (porAgente) {
          return of({ success: true, result: porAgente.CODIGO, errors: [] });
        }
        return this._crearAsociacion(valor);
      })
    );
  }

  private _crearAsociacion(vendedor: string): Observable<IResponse<string>> {
    return this._httpClient
      .post<IResponse<unknown>>(URL_AGENTE_RT, { vendedor })
      .pipe(
        catchError(() =>
          of({
            success: false,
            result: {},
            errors: ["Error al vincular el agente"],
          } as IResponse<unknown>)
        ),
        switchMap((rt) => {
          if (!rt.success && !rt.errors?.[0]?.includes("ya esta registrado")) {
            return of({ success: false, result: "", errors: rt.errors });
          }
          return this._httpClient
            .post<IResponse<IAgenteAsocRtRaw>>(URL_AGENTE_ASOC, {
              agente: vendedor,
              codigo: vendedor,
              tipo: "V",
            })
            .pipe(
              map((asoc) =>
                asoc.success
                  ? { success: true, result: vendedor, errors: [] }
                  : { success: false, result: "", errors: asoc.errors }
              ),
              catchError(() =>
                of({
                  success: false,
                  result: "",
                  errors: ["Error al vincular el agente al módulo de rutas"],
                })
              )
            );
        })
      );
  }
}
