import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { TIEMPO_ESPERA_HTTP } from "@app/interceptors/error-api.interceptor";
import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { IResponse, IResponsePaginada } from "@app/shared/api-models-base-interface";
import {
  ICatalogoConfig,
  ICatalogoMeta,
  IFiltroMetas,
  IMetaVenta,
  IMetaVentaBody,
  IVendedor,
  conTildes,
  IConsultaMetas,
  IResultadoImportacion,
  IVentaDia,
  IResultadoActualizarVentas,
} from "./metas.model";

const URL_FR = environment.host + "/fr";
const LIMITE_MAX = 100;

/** API de Metas de Venta y sus catálogos (líderes, proveedores, líneas de negocio). */
@Injectable({
  providedIn: "root",
})
export class MetasApiService {
  constructor(private _http: HttpClient) {}

  // ---------------- Catálogos (lider / proveedorMeta / lineaNegocio) ----------------

  listarCatalogo(
    cfg: ICatalogoConfig,
    filtro: { q?: string; activo?: "S" | "N" | "" },
    page: number,
    limit: number
  ): Observable<IResponsePaginada<ICatalogoMeta[]>> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    if (filtro.q?.trim()) params = params.set("q", filtro.q.trim());
    if (filtro.activo) params = params.set(cfg.campoActivo, filtro.activo);
    return this._http.get<IResponsePaginada<ICatalogoMeta[]>>(`${URL_FR}/${cfg.recurso}`, { params });
  }

  /** Todas las filas del catálogo (recorre las páginas de 100). */
  todosCatalogo(cfg: ICatalogoConfig, soloActivos = false): Observable<ICatalogoMeta[]> {
    const activo = soloActivos ? "S" : "";
    return this._todasLasPaginas((page) => this.listarCatalogo(cfg, { activo }, page, LIMITE_MAX));
  }

  crearCatalogo(cfg: ICatalogoConfig, body: Record<string, unknown>): Observable<IResponse<ICatalogoMeta>> {
    return this._http.post<IResponse<ICatalogoMeta>>(`${URL_FR}/${cfg.recurso}`, body);
  }

  actualizarCatalogo(cfg: ICatalogoConfig, id: number, body: Record<string, unknown>): Observable<IResponse<unknown>> {
    return this._http.put<IResponse<unknown>>(`${URL_FR}/${cfg.recurso}/${id}`, body);
  }

  eliminarCatalogo(cfg: ICatalogoConfig, id: number): Observable<IResponse<unknown>> {
    return this._http.delete<IResponse<unknown>>(`${URL_FR}/${cfg.recurso}/${id}`);
  }

  // ---------------- Metas de venta por producto ----------------

  listarMetas(filtro: IFiltroMetas, page: number, limit: number): Observable<IResponsePaginada<IMetaVenta[]>> {
    let params = new HttpParams().set("page", page).set("limit", limit);
    const valores: Record<string, unknown> = {
      anio: filtro.anio,
      mes: filtro.mes,
      idLineaNegocio: filtro.idLineaNegocio,
      idLider: filtro.idLider,
      idProveedor: filtro.idProveedor,
      vendedor: filtro.vendedor,
      articulo: filtro.articulo?.trim(),
    };
    Object.keys(valores).forEach((k) => {
      const v = valores[k];
      if (v !== null && v !== undefined && v !== "") params = params.set(k, String(v));
    });
    return this._http.get<IResponsePaginada<IMetaVenta[]>>(`${URL_FR}/metaVentaProducto`, { params });
  }

  /** Todas las metas que cumplan el filtro (para exportar). */
  todasLasMetas(filtro: IFiltroMetas): Observable<IMetaVenta[]> {
    return this._todasLasPaginas((page) => this.listarMetas(filtro, page, LIMITE_MAX));
  }

  crearMeta(body: IMetaVentaBody): Observable<IResponse<IMetaVenta>> {
    return this._http.post<IResponse<IMetaVenta>>(`${URL_FR}/metaVentaProducto`, body);
  }

  actualizarMeta(id: number, body: Partial<IMetaVentaBody>): Observable<IResponse<unknown>> {
    return this._http.put<IResponse<unknown>>(`${URL_FR}/metaVentaProducto/${id}`, body);
  }

  eliminarMeta(id: number): Observable<IResponse<unknown>> {
    return this._http.delete<IResponse<unknown>>(`${URL_FR}/metaVentaProducto/${id}`);
  }

  // ---------------- Carga de metas por Excel (la valida y guarda el backend) ----------------

  /** Manual de la carga: plantilla, reglas, códigos válidos y periodos ya cargados. */
  consultaMetas(anio?: number | null, mes?: number | null): Observable<IResponse<IConsultaMetas>> {
    let params = new HttpParams();
    if (anio) params = params.set("anio", anio);
    if (mes) params = params.set("mes", mes);
    return this._http.get<IResponse<IConsultaMetas>>(`${URL_FR}/metaVentaProducto/consulta`, { params });
  }

  /**
   * Sube el Excel (.xlsx, campo "archivo"). Con soloValidar = true es la vista previa (no guarda);
   * sin él, guarda todo o nada. Archivos grandes: hasta 3 minutos de espera.
   */
  importarMetas(archivo: File, soloValidar: boolean): Observable<IResponse<IResultadoImportacion>> {
    const datos = new FormData();
    datos.append("archivo", archivo, archivo.name);
    let params = new HttpParams();
    if (soloValidar) params = params.set("validar", "true");
    return this._http.post<IResponse<IResultadoImportacion>>(`${URL_FR}/metaVentaProducto/importar`, datos, {
      params,
      context: new HttpContext().set(TIEMPO_ESPERA_HTTP, 180000),
    });
  }

  /** GET /fr/metaVentaProducto/ventasDiarias disponible (ventas del ERP en vivo). */
  static readonly VENTAS_BACKEND_DISPONIBLE: boolean = true;

  /**
   * Ventas del ERP de un mes por vendedor, artículo y día, en vivo (GET /ventasDiarias).
   * Sin vendedor trae todos (~3 s). Solo días con movimiento; pueden venir negativas (devoluciones).
   */
  ventasDelMes(anio: number, mes: number, vendedor?: string | null, articulo?: string | null): Observable<IVentaDia[]> {
    if (!MetasApiService.VENTAS_BACKEND_DISPONIBLE) return of([]);
    let params = new HttpParams().set("anio", anio).set("mes", mes);
    if (vendedor) params = params.set("vendedor", vendedor);
    if (articulo) params = params.set("articulo", articulo.trim());
    return this._http
      .get<IResponse<{ ventas: IVentaDia[] }>>(`${URL_FR}/metaVentaProducto/ventasDiarias`, {
        params,
        context: new HttpContext().set(TIEMPO_ESPERA_HTTP, 120000),
      })
      .pipe(
        map((r) => {
          if (!r.success) throw new Error(conTildes((r.errors || [])[0] || "No se pudieron consultar las ventas"));
          return (r.result?.ventas || []).map((v) => ({
            ...v,
            VENDEDOR: String(v.VENDEDOR ?? "").trim(),
            ARTICULO: String(v.ARTICULO ?? "").trim(),
            DIA: Number(v.DIA),
            SEMANA: Number(v.SEMANA),
            UNIDADES: Number(v.UNIDADES) || 0,
            VALOR: Number(v.VALOR) || 0,
            COSTO: v.COSTO === undefined || v.COSTO === null ? null : Number(v.COSTO),
          }));
        })
      );
  }

  /**
   * Recalcula Venta_Unidades / Venta_Valor de las metas desde las facturas del ERP
   * (POST /actualizarVentas). anio+mes = ese mes; solo anio = todo el año; nada = todos los periodos.
   * Puede tardar: hasta 5 minutos de espera.
   */
  actualizarVentas(anio?: number | null, mes?: number | null): Observable<IResponse<IResultadoActualizarVentas> & { mensaje?: string }> {
    const body: { anio?: number; mes?: number } = {};
    if (anio) body.anio = anio;
    if (anio && mes) body.mes = mes;
    return this._http.post<IResponse<IResultadoActualizarVentas> & { mensaje?: string }>(
      `${URL_FR}/metaVentaProducto/actualizarVentas`,
      body,
      { context: new HttpContext().set(TIEMPO_ESPERA_HTTP, 300000) }
    );
  }

  /** Borra todas las metas de un vendedor en un año/mes. */
  eliminarPeriodo(anio: number, mes: number, vendedor: string): Observable<IResponse<{ eliminadas: number }>> {
    const params = new HttpParams().set("anio", anio).set("mes", mes).set("vendedor", vendedor);
    return this._http.delete<IResponse<{ eliminadas: number }>>(`${URL_FR}/metaVentaProducto/periodo`, { params });
  }

  // ---------------- Vendedores del ERP (solo lectura) ----------------

  /**
   * Vendedor del ERP a partir de lo que trae una plantilla: primero como código (VBM), luego por
   * nombre (sin importar mayúsculas, tildes ni espacios). null si no se encuentra.
   */
  todosVendedores(): Observable<IVendedor[]> {
    return this._todasLasPaginas((page) =>
      this._http.get<IResponsePaginada<{ VENDEDOR: string; NOMBRE: string }[]>>(`${URL_FR}/vendedorErp`, {
        params: new HttpParams().set("page", page).set("limit", LIMITE_MAX),
      })
    ).pipe(
      map((filas) =>
        filas
          .map((v) => ({ codigo: String(v.VENDEDOR).trim(), nombre: String(v.NOMBRE ?? "").trim() }))
          .sort((a, b) => a.codigo.localeCompare(b.codigo))
      )
    );
  }

  /** Pide la página 1 y, si hay más, el resto en paralelo. Falla si el backend responde success=false. */
  private _todasLasPaginas<T>(pedir: (page: number) => Observable<IResponsePaginada<T[]>>): Observable<T[]> {
    return pedir(1).pipe(
      switchMap((primera) => {
        if (!primera.success) throw new Error(primera.errors?.join(", ") || "Error al consultar");
        const filas = primera.result || [];
        const paginas = primera.pagination?.totalPages ?? 1;
        if (paginas <= 1) return of(filas);
        const resto = Array.from({ length: paginas - 1 }, (_, i) => pedir(i + 2));
        return forkJoin(resto).pipe(map((rs) => filas.concat(...rs.map((r) => r.result || []))));
      })
    );
  }
}

/** Mensaje legible de un error HTTP. */
export const mensajeErrorHttp = (error: unknown, porDefecto = "Ocurrió un error"): string => {
  if (error instanceof HttpErrorResponse) {
    const errores = (error.error as { errors?: string[] } | null)?.errors;
    return conTildes(errores?.length ? errores.join(", ") : error.message || porDefecto);
  }
  if (error instanceof Error && error.message) return conTildes(error.message);
  return porDefecto;
};
