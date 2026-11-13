import { HttpClient, HttpParams } from "@angular/common/http";
import { EMPTY, Observable } from "rxjs";
import { expand, reduce } from "rxjs/operators";
import { IResponsePaginada } from "@app/shared/api-models-base-interface";

const LIMIT_PAGINA = 100;

/** Recorre todas las páginas de un GET paginado de FR (máx. 100 por página). */
export const todasLasPaginas = <T>(
  http: HttpClient,
  url: string,
  params: HttpParams = new HttpParams()
): Observable<T[]> => {
  const pagina = (page: number) =>
    http.get<IResponsePaginada<T[]>>(url, {
      params: params.set("page", page).set("limit", LIMIT_PAGINA),
    });
  return pagina(1).pipe(
    expand((r) => {
      const p = r.pagination;
      return r.success && p && p.page < p.totalPages ? pagina(p.page + 1) : EMPTY;
    }),
    reduce((acumulado: T[], r) => {
      if (!r.success) throw new Error(r.errors?.join(", ") || "Error al consultar");
      return acumulado.concat(r.result || []);
    }, [])
  );
};

/** HttpParams sin los valores vacíos. */
export const paramsDe = (filtro: object): HttpParams => {
  let params = new HttpParams();
  Object.entries(filtro).forEach(([clave, valor]) => {
    if (valor != null && valor !== "") params = params.set(clave, String(valor));
  });
  return params;
};
