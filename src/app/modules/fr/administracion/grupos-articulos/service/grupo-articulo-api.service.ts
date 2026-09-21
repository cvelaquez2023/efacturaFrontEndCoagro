import { EMPTY, Observable } from "rxjs";
import { expand, reduce } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import {
  ICreateGrupoArticuloModel,
  ICreateGrupoArtAsocModel,
  IResponseArticuloRt,
  IResponseGrupoArticulo,
  IResponseGrupoArtAsoc,
} from "../model/grupo-articulo-fr-model-interface";

const URL_GRUPO_ARTICULO = environment.host + "/fr/grupoArticuloRt";
const URL_ARTICULO_RT = environment.host + "/fr/articuloRt";
const URL_GRUPO_ART_ASOC = environment.host + "/fr/grupoArtAsocRt";
const LIMIT_PAGINA = 100;

interface IPaginacion {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface IResponsePaginada<T> extends IResponse<T> {
  pagination: IPaginacion;
}

@Injectable({
  providedIn: "root",
})
export class GrupoArticuloApiService {
  constructor(private _httpClient: HttpClient) {}

  getGruposArticulo(): Observable<IResponse<IResponseGrupoArticulo[]>> {
    return this._httpClient.get<IResponse<IResponseGrupoArticulo[]>>(
      URL_GRUPO_ARTICULO
    );
  }
  createGrupoArticulo(
    grupoArticulo: ICreateGrupoArticuloModel
  ): Observable<IResponse<IResponseGrupoArticulo>> {
    return this._httpClient.post<IResponse<IResponseGrupoArticulo>>(
      URL_GRUPO_ARTICULO,
      grupoArticulo
    );
  }
  updateGrupoArticulo(
    grupoArticulo: string,
    data: ICreateGrupoArticuloModel
  ): Observable<IResponse<number>> {
    const url = URL_GRUPO_ARTICULO + "/" + encodeURIComponent(grupoArticulo);
    return this._httpClient.put<IResponse<number>>(url, data);
  }
  deleteGrupoArticulo(grupoArticulo: string): Observable<IResponse<number>> {
    const url = URL_GRUPO_ARTICULO + "/" + encodeURIComponent(grupoArticulo);
    return this._httpClient.delete<IResponse<number>>(url);
  }

  /** Artículos ya registrados en el módulo de rutas (no se crean aquí, solo se listan). */
  private _getArticulosRtPagina(
    page: number
  ): Observable<IResponsePaginada<IResponseArticuloRt[]>> {
    const url = `${URL_ARTICULO_RT}?page=${page}&limit=${LIMIT_PAGINA}`;
    return this._httpClient.get<IResponsePaginada<IResponseArticuloRt[]>>(url);
  }
  getAllArticulosRt(): Observable<IResponseArticuloRt[]> {
    return this._getAllPaginas((page) => this._getArticulosRtPagina(page));
  }

  /** Artículos ya vinculados a un grupo específico. */
  private _getArticulosAsociadosPagina(
    grupoArticulo: string,
    page: number
  ): Observable<IResponsePaginada<IResponseGrupoArtAsoc[]>> {
    const url = `${URL_GRUPO_ART_ASOC}?grupoArticulo=${encodeURIComponent(
      grupoArticulo
    )}&page=${page}&limit=${LIMIT_PAGINA}`;
    return this._httpClient.get<IResponsePaginada<IResponseGrupoArtAsoc[]>>(
      url
    );
  }
  getAllArticulosAsociados(
    grupoArticulo: string
  ): Observable<IResponseGrupoArtAsoc[]> {
    return this._getAllPaginas((page) =>
      this._getArticulosAsociadosPagina(grupoArticulo, page)
    );
  }

  /** Todas las asociaciones grupo-artículo, sin filtrar por grupo. */
  private _getAsociacionesPagina(
    page: number
  ): Observable<IResponsePaginada<IResponseGrupoArtAsoc[]>> {
    const url = `${URL_GRUPO_ART_ASOC}?page=${page}&limit=${LIMIT_PAGINA}`;
    return this._httpClient.get<IResponsePaginada<IResponseGrupoArtAsoc[]>>(
      url
    );
  }
  getAllAsociaciones(): Observable<IResponseGrupoArtAsoc[]> {
    return this._getAllPaginas((page) => this._getAsociacionesPagina(page));
  }

  asociarArticulo(
    data: ICreateGrupoArtAsocModel
  ): Observable<IResponse<IResponseGrupoArtAsoc>> {
    return this._httpClient.post<IResponse<IResponseGrupoArtAsoc>>(
      URL_GRUPO_ART_ASOC,
      data
    );
  }
  desasociarArticulo(
    grupoArticulo: string,
    articulo: string
  ): Observable<IResponse<number>> {
    const url = `${URL_GRUPO_ART_ASOC}/${encodeURIComponent(
      grupoArticulo
    )}/${encodeURIComponent(articulo)}`;
    return this._httpClient.delete<IResponse<number>>(url);
  }

  /** Recorre todas las páginas de un endpoint paginado y devuelve el resultado combinado. */
  private _getAllPaginas<T>(
    fetchPagina: (page: number) => Observable<IResponsePaginada<T[]>>
  ): Observable<T[]> {
    return fetchPagina(1).pipe(
      expand((response) =>
        response.pagination &&
        response.pagination.page < response.pagination.totalPages
          ? fetchPagina(response.pagination.page + 1)
          : EMPTY
      ),
      reduce(
        (acumulado: T[], response) => acumulado.concat(response.result || []),
        [] as T[]
      )
    );
  }
}
