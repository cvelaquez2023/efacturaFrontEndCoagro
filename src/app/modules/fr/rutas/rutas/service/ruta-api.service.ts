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
  ICreateRutaModel,
  IResponseRuta,
} from "../model/ruta-fr-model-interface";

const URL_RUTA = environment.host + "/fr/rutaRt";
const LIMIT_PAGINA = 100;

@Injectable({
  providedIn: "root",
})
export class RutaApiService {
  constructor(private _httpClient: HttpClient) {}

  /** GET /fr/rutaRt pagina (20 por página por defecto, 100 máximo), pero todos los que lo
   *  consumen (pickers F1, desplegables, MatTableDataSource con paginator del lado del cliente
   *  en RutasPageComponent) siempre esperaron el catálogo completo en `result`. Con más de una
   *  página, rutas reales quedaban fuera silenciosamente — por eso una ruta ya creada podía
   *  parecer que "no existe" en un picker o en Asignación de Rutas. Se recorren todas las
   *  páginas aquí para que ningún consumidor tenga que saber que el backend pagina. */
  getRutas(
    activa?: string,
    grupoTelefono?: string
  ): Observable<IResponse<IResponseRuta[]>> {
    const pagina = (page: number) => {
      let params = new HttpParams()
        .set("page", page)
        .set("limit", LIMIT_PAGINA);
      if (activa) params = params.set("activa", activa);
      if (grupoTelefono) params = params.set("grupoTelefono", grupoTelefono);
      return this._httpClient.get<IResponsePaginada<IResponseRuta[]>>(
        URL_RUTA,
        { params }
      );
    };
    return pagina(1).pipe(
      expand((response) =>
        response.success &&
        response.pagination.page < response.pagination.totalPages
          ? pagina(response.pagination.page + 1)
          : EMPTY
      ),
      reduce(
        (acumulado: IResponse<IResponseRuta[]>, response) => ({
          success: acumulado.success && response.success,
          errors: response.success
            ? acumulado.errors
            : [...acumulado.errors, ...response.errors],
          result: response.success
            ? acumulado.result.concat(response.result)
            : acumulado.result,
        }),
        { success: true, errors: [] as string[], result: [] as IResponseRuta[] }
      )
    );
  }
  createRuta(ruta: ICreateRutaModel): Observable<IResponse<IResponseRuta>> {
    return this._httpClient.post<IResponse<IResponseRuta>>(URL_RUTA, ruta);
  }
  updateRuta(
    ruta: string,
    data: ICreateRutaModel
  ): Observable<IResponse<number>> {
    const url = URL_RUTA + "/" + encodeURIComponent(ruta);
    return this._httpClient.put<IResponse<number>>(url, data);
  }
  deleteRuta(ruta: string): Observable<IResponse<number>> {
    const url = URL_RUTA + "/" + encodeURIComponent(ruta);
    return this._httpClient.delete<IResponse<number>>(url);
  }
}
