import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IResponse, IResponsePaginada } from "@app/shared/api-models-base-interface";
import { IConfigBD, IFilaBD } from "./bon-desc.model";

const URL_FR = environment.host + "/fr";

/** Filtros del listado: entidad (cliente, articulo, nivelPrecio, moneda, articuloBonif), fecha o vigente. */
export type FiltroBD = Record<string, string | number | null | undefined>;

/** CRUD genérico de /fr/descuentoCliart, /descuentoNivel, /bonificacionCliart y /bonificacionNivel. */
@Injectable({ providedIn: "root" })
export class BonDescApiService {
  constructor(private _http: HttpClient) {}

  listar(cfg: IConfigBD, filtro: FiltroBD, page: number, limit: number): Observable<IResponsePaginada<IFilaBD[]>> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    Object.entries(filtro).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== "") params = params.set(k, String(v).trim());
    });
    return this._http.get<IResponsePaginada<IFilaBD[]>>(`${URL_FR}/${cfg.recurso}`, { params });
  }

  crear(cfg: IConfigBD, body: Record<string, unknown>): Observable<IResponse<IFilaBD>> {
    return this._http.post<IResponse<IFilaBD>>(`${URL_FR}/${cfg.recurso}`, body);
  }

  /** `llave` = ruta de la llave ACTUAL (ver llaveDe); el body trae el rango nuevo y/o los valores. */
  actualizar(cfg: IConfigBD, llave: string, body: Record<string, unknown>): Observable<IResponse<IFilaBD>> {
    return this._http.put<IResponse<IFilaBD>>(`${URL_FR}/${cfg.recurso}/${llave}`, body);
  }

  eliminar(cfg: IConfigBD, llave: string): Observable<IResponse<number>> {
    return this._http.delete<IResponse<number>>(`${URL_FR}/${cfg.recurso}/${llave}`);
  }
}
