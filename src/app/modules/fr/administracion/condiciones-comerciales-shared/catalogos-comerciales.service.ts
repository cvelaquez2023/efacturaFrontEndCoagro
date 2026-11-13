import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map, shareReplay } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import { ArticuloErpApiService } from "../../procesos/carga-articulos/service/articulo-erp-api.service";
import { ClienteErpApiService } from "../../procesos/carga-clientes/service/cliente-erp-api.service";
import { ReportesFrApiService } from "../../reportes/shared/reportes-fr-api.service";
import { RutaApiService } from "../../rutas/rutas/service/ruta-api.service";
import {
  IArticuloBusqueda,
  ICarteraCliente,
  ICodigoNombre,
  LINEAS_MOCK,
  PRECIOS_BASE_MOCK,
  TIPOS_CLIENTE_MOCK,
} from "./condiciones-comerciales.model";

const URL_LINEA_ARTICULO = environment.host + "/fr/lineaArticulo";
const URL_CLIENTE_ERP = environment.host + "/fr/clienteErp";
const URL_ARTICULO_ERP = environment.host + "/fr/articuloErp";

/** Fila de GET /fr/articuloErp (el backend devuelve más campos que la interfaz de Carga de Artículos). */
export interface IArticuloErpCompleto {
  ARTICULO: string;
  DESCRIPCION: string;
  CLASIFICACION_3?: string | null;
  PRECIO_BASE_DOLAR?: number | string | null;
}

/**
 * Catálogos de apoyo para Condiciones, Promociones y Consulta de Precios. Clientes y artículos
 * se buscan en el ERP real (/fr/clienteErp, /fr/articuloErp); rutas, agentes y cartera también
 * son reales. Líneas y tipos de cliente son copias fijas hasta que el backend los exponga.
 */
@Injectable({
  providedIn: "root",
})
export class CatalogosComercialesService {
  /** true cuando exista GET /fr/lineaArticulo (spec §5.3). */
  static readonly LINEAS_BACKEND_DISPONIBLE: boolean = true;

  private _lineas$?: Observable<ICodigoNombre[]>;
  private _cartera$?: Observable<Map<string, ICarteraCliente>>;
  private _rutas$?: Observable<ICodigoNombre[]>;
  private _clientes = new Map<string, Observable<string | null>>();
  private _articulos = new Map<string, Observable<IArticuloErpCompleto | null>>();

  constructor(
    private _http: HttpClient,
    private _articuloErp: ArticuloErpApiService,
    private _clienteErp: ClienteErpApiService,
    private _reportesApi: ReportesFrApiService,
    private _rutaApi: RutaApiService
  ) {}

  getLineas(): Observable<ICodigoNombre[]> {
    if (!CatalogosComercialesService.LINEAS_BACKEND_DISPONIBLE) return of(LINEAS_MOCK);
    if (!this._lineas$) {
      this._lineas$ = this._http
        .get<IResponse<{ LINEA: string; DESCRIPCION: string }[]>>(URL_LINEA_ARTICULO)
        .pipe(
          map((r) =>
            (r.result || []).map((l) => ({
              codigo: String(l.LINEA).trim(),
              nombre: l.DESCRIPCION,
            }))
          ),
          catchError(() => of(LINEAS_MOCK)),
          shareReplay(1)
        );
    }
    return this._lineas$;
  }

  /** Nombre de un cliente del ERP por código (GET /fr/clienteErp/:cliente), con caché. */
  nombreCliente(codigo: string): Observable<string | null> {
    const clave = String(codigo ?? "").trim();
    if (!clave) return of(null);
    if (!this._clientes.has(clave)) {
      this._clientes.set(
        clave,
        this._http.get<IResponse<{ NOMBRE?: string } | null>>(`${URL_CLIENTE_ERP}/${encodeURIComponent(clave)}`).pipe(
          map((r) => (r.success && r.result?.NOMBRE ? String(r.result.NOMBRE).trim() : null)),
          catchError(() => of(null)),
          shareReplay(1)
        )
      );
    }
    return this._clientes.get(clave)!;
  }

  /** Artículo del ERP por código (GET /fr/articuloErp/:articulo), con caché. */
  articulo(codigo: string): Observable<IArticuloErpCompleto | null> {
    const clave = String(codigo ?? "").trim();
    if (!clave) return of(null);
    if (!this._articulos.has(clave)) {
      this._articulos.set(
        clave,
        this._http
          .get<IResponse<IArticuloErpCompleto | null>>(`${URL_ARTICULO_ERP}/${encodeURIComponent(clave)}`)
          .pipe(
            map((r) => (r.success && r.result?.ARTICULO ? r.result : null)),
            catchError(() => of(null)),
            shareReplay(1)
          )
      );
    }
    return this._articulos.get(clave)!;
  }

  /** Descripción de un código según el alcance (A artículo, L línea, T el mismo texto). */
  describirValor(alcance: string, valor: string): Observable<string> {
    const v = String(valor ?? "").trim();
    if (alcance === "L") {
      return this.getLineas().pipe(map((ls) => ls.find((l) => l.codigo === v)?.nombre || v));
    }
    if (alcance === "A") {
      return this.articulo(v).pipe(map((a) => (a?.DESCRIPCION ? String(a.DESCRIPCION).trim() : v)));
    }
    return of(v);
  }

  getTiposCliente(): Observable<ICodigoNombre[]> {
    return of(TIPOS_CLIENTE_MOCK);
  }

  getRutas(): Observable<ICodigoNombre[]> {
    if (!this._rutas$) {
      this._rutas$ = this._rutaApi.getRutas().pipe(
        map((r) =>
          (r.result || []).map((x) => ({
            codigo: String(x.RUTA).trim(),
            nombre: x.DESCRIPCION,
          }))
        ),
        catchError(() => of([] as ICodigoNombre[])),
        shareReplay(1)
      );
    }
    return this._rutas$;
  }

  buscarClientes(q: string): Observable<ICodigoNombre[]> {
    return this._clienteErp.getClientesErp(q, 1, 20).pipe(
      map((r) =>
        (r.result || []).map((c) => ({
          codigo: String(c.CLIENTE).trim(),
          nombre: c.NOMBRE,
        }))
      ),
      catchError(() => of([] as ICodigoNombre[]))
    );
  }

  buscarArticulos(q: string): Observable<IArticuloBusqueda[]> {
    return this._articuloErp.getArticulosErp(q, 1, 20).pipe(
      map((r) =>
        ((r.result || []) as IArticuloErpCompleto[]).map((a) => {
          const codigo = String(a.ARTICULO).trim();
          const precioErp = Number(a.PRECIO_BASE_DOLAR ?? 0);
          return {
            codigo,
            nombre: a.DESCRIPCION,
            linea: a.CLASIFICACION_3 ? String(a.CLASIFICACION_3).trim() : null,
            precioBase: precioErp > 0 ? precioErp : PRECIOS_BASE_MOCK[codigo] ?? null,
          };
        })
      ),
      catchError(() => of([] as IArticuloBusqueda[]))
    );
  }

  /** Cliente → rutas y agente (RUTA_CLIENTE + RUTA_ASIGNADA_RT + agentes). Si falla, mapa vacío. */
  getCartera(): Observable<Map<string, ICarteraCliente>> {
    if (!this._cartera$) {
      this._cartera$ = forkJoin({
        asignaciones: this._reportesApi.getRutaClientes(),
        rutas: this._reportesApi.getRutasAsignadas(),
        agentes: this._reportesApi.getAgentes(),
      }).pipe(
        map(({ asignaciones, rutas, agentes }) => {
          const agenteDeRuta = new Map(
            rutas.map((r) => [String(r.RUTA).trim(), String(r.AGENTE ?? "").trim()])
          );
          const nombreAgente = new Map(agentes.map((a) => [a.codigo, a.nombre]));
          const cartera = new Map<string, ICarteraCliente>();
          asignaciones.forEach((a) => {
            const cliente = String(a.CLIENTE).trim();
            const ruta = String(a.RUTA).trim();
            const actual = cartera.get(cliente) ?? { rutas: [], agente: null, agenteNombre: null };
            if (!actual.rutas.includes(ruta)) actual.rutas.push(ruta);
            if (!actual.agente) {
              actual.agente = agenteDeRuta.get(ruta) || null;
              actual.agenteNombre = actual.agente ? nombreAgente.get(actual.agente) || actual.agente : null;
            }
            cartera.set(cliente, actual);
          });
          return cartera;
        }),
        catchError(() => of(new Map<string, ICarteraCliente>())),
        shareReplay(1)
      );
    }
    return this._cartera$;
  }
}

/** Mensaje legible de un error HTTP o del `errors` de la respuesta. */
export const mensajeErrorComercial = (error: unknown, porDefecto = "Ocurrió un error"): string => {
  if (error instanceof HttpErrorResponse) {
    const errores = (error.error as { errors?: string[] } | null)?.errors;
    return errores?.length ? errores.join(", ") : error.message || porDefecto;
  }
  if (error instanceof Error && error.message) return error.message;
  return porDefecto;
};
