import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { delay, map, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import { hoyIso } from "../../../reportes/shared/reporte-utils";
import { CatalogosComercialesService } from "../../condiciones-comerciales-shared/catalogos-comerciales.service";
import {
  estadoRegla,
  ICondicionCliente,
  ICondicionClienteBody,
  IFiltroCondicion,
  LINEAS_MOCK,
  validarCondicion,
} from "../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { CondicionesMockStoreService } from "../../condiciones-comerciales-shared/condiciones-mock-store.service";
import { paramsDe, todasLasPaginas } from "../../condiciones-comerciales-shared/paginas";

const URL_CONDICION = environment.host + "/fr/condicionCliente";

/** Fila tal como la devuelve GET /fr/condicionCliente (columnas de erpadmin.FR_CONDICION_CLIENTE). */
interface IFilaCondicionBackend {
  ID: number;
  CLIENTE: string;
  ALCANCE: "A" | "L" | "T";
  VALOR: string;
  DESCUENTO_MAX: number | string | null;
  PRECIO_ESPECIAL: number | string | null;
  CANTIDAD_MIN: number | string | null;
  FECHA_INICIO: string;
  FECHA_FIN: string | null;
  ACTIVA: string;
  CREADO_POR?: string | null;
  FECHA_CREACION?: string | null;
}

/** DECIMAL de SQL Server llega como texto. */
const numONull = (v: number | string | null | undefined): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);
const soloFecha = (v: string | null | undefined): string | null => (v ? String(v).slice(0, 10) : null);
const LATENCIA_MOCK = 150;

/**
 * Condiciones especiales por cliente (spec §5.1, erpadmin.FR_CONDICION_CLIENTE).
 * Mientras BACKEND_DISPONIBLE = false todo vive en CondicionesMockStoreService (se pierde al
 * recargar); las llamadas HTTP ya están escritas contra el contrato del documento.
 */
@Injectable({
  providedIn: "root",
})
export class CondicionClienteApiService {
  static readonly BACKEND_DISPONIBLE: boolean = true;

  constructor(
    private _http: HttpClient,
    private _store: CondicionesMockStoreService,
    private _catalogos: CatalogosComercialesService
  ) {}

  /** Todas las condiciones que cumplen el filtro (recorre las páginas). */
  getCondiciones(filtro: IFiltroCondicion = {}): Observable<ICondicionCliente[]> {
    const fecha = filtro.fecha || hoyIso();
    if (CondicionClienteApiService.BACKEND_DISPONIBLE) {
      // El backend filtra por cliente; estado, agente, ruta y texto se filtran aquí sobre las filas completas.
      return todasLasPaginas<IFilaCondicionBackend>(this._http, URL_CONDICION, paramsDe({ cliente: filtro.cliente })).pipe(
        switchMap((filas) => this._completar(filas, fecha)),
        map((filas) => this._filtrar(filas, filtro))
      );
    }
    return of(this._filtrar(this._store.condiciones.map((c) => ({ ...c, ESTADO: estadoRegla(c.ACTIVA, c.FECHA_INICIO, c.FECHA_FIN, fecha) })), filtro)).pipe(
      delay(LATENCIA_MOCK)
    );
  }

  private _filtrar(condiciones: ICondicionCliente[], filtro: IFiltroCondicion): ICondicionCliente[] {
    const q = (filtro.q ?? "").trim().toUpperCase();
    return condiciones
      .filter((c) => !filtro.cliente || c.CLIENTE === filtro.cliente)
      .filter((c) => !filtro.estado || c.ESTADO === filtro.estado)
      .filter((c) => !filtro.agente || c.AGENTE === filtro.agente || c.AGENTE_NOMBRE === filtro.agente)
      .filter((c) => !filtro.ruta || c.RUTAS.split(",").map((r) => r.trim()).includes(filtro.ruta))
      .filter(
        (c) =>
          !q ||
          c.CLIENTE.toUpperCase().includes(q) ||
          c.CLIENTE_NOMBRE.toUpperCase().includes(q) ||
          c.VALOR.toUpperCase().includes(q) ||
          c.VALOR_DESCRIPCION.toUpperCase().includes(q)
      );
  }

  /** Agrega a las filas del backend nombre del cliente, descripción del valor, estado, rutas y agente. */
  private _completar(filas: IFilaCondicionBackend[], fecha: string): Observable<ICondicionCliente[]> {
    if (!filas.length) return of([]);
    const clientes = [...new Set(filas.map((f) => String(f.CLIENTE).trim()))];
    const valores = [...new Set(filas.map((f) => `${f.ALCANCE}|${String(f.VALOR).trim()}`))];
    return forkJoin({
      cartera: this._catalogos.getCartera(),
      nombres: forkJoin(clientes.map((c) => this._catalogos.nombreCliente(c))),
      descripciones: forkJoin(valores.map((v) => this._catalogos.describirValor(v.split("|")[0], v.slice(2)))),
    }).pipe(
      map(({ cartera, nombres, descripciones }) => {
        const nombreDe = new Map(clientes.map((c, i) => [c, nombres[i]]));
        const descDe = new Map(valores.map((v, i) => [v, descripciones[i]]));
        return filas.map((f) => {
          const cliente = String(f.CLIENTE).trim();
          const valor = String(f.VALOR).trim();
          const info = cartera.get(cliente);
          const inicio = soloFecha(f.FECHA_INICIO)!;
          const fin = soloFecha(f.FECHA_FIN);
          return {
            ID: f.ID,
            CLIENTE: cliente,
            CLIENTE_NOMBRE: nombreDe.get(cliente) || cliente,
            ALCANCE: f.ALCANCE,
            VALOR: valor,
            VALOR_DESCRIPCION: descDe.get(`${f.ALCANCE}|${valor}`) || valor,
            DESCUENTO_MAX: numONull(f.DESCUENTO_MAX),
            PRECIO_ESPECIAL: numONull(f.PRECIO_ESPECIAL),
            CANTIDAD_MIN: numONull(f.CANTIDAD_MIN),
            FECHA_INICIO: inicio,
            FECHA_FIN: fin,
            ACTIVA: f.ACTIVA === "N" ? "N" : "S",
            NOTAS: null,
            ESTADO: estadoRegla(f.ACTIVA === "N" ? "N" : "S", inicio, fin, fecha),
            RUTAS: info ? info.rutas.join(", ") : "",
            AGENTE: info?.agente ?? null,
            AGENTE_NOMBRE: info?.agenteNombre ?? null,
            EN_CARTERA: !!info && info.rutas.length > 0,
            USUARIO_CREACION: f.CREADO_POR ?? null,
            FECHA_CREACION: f.FECHA_CREACION ?? null,
          } as ICondicionCliente;
        });
      })
    );
  }

  getCondicion(id: number): Observable<IResponse<ICondicionCliente | null>> {
    if (CondicionClienteApiService.BACKEND_DISPONIBLE) {
      return this._http.get<IResponse<IFilaCondicionBackend | null>>(`${URL_CONDICION}/${id}`).pipe(
        switchMap((r) =>
          r.success && r.result
            ? this._completar([r.result], hoyIso()).pipe(map(([c]) => ({ ...r, result: c })))
            : of({ ...r, result: null })
        )
      );
    }
    const c = this._store.condiciones.find((x) => x.ID === id) ?? null;
    return of({
      success: !!c,
      errors: c ? [] : ["No existe la condición"],
      result: c ? { ...c, ESTADO: estadoRegla(c.ACTIVA, c.FECHA_INICIO, c.FECHA_FIN, hoyIso()) } : null,
    });
  }

  /**
   * Crear. `extra` solo se usa en modo prueba para mostrar nombres (el backend los resuelve).
   */
  createCondicion(
    body: ICondicionClienteBody,
    extra: { clienteNombre: string; valorDescripcion: string } = { clienteNombre: "", valorDescripcion: "" }
  ): Observable<IResponse<ICondicionCliente | null>> {
    if (CondicionClienteApiService.BACKEND_DISPONIBLE) {
      return this._http.post<IResponse<ICondicionCliente | null>>(URL_CONDICION, body);
    }
    return this._guardarMock(null, body, extra);
  }

  updateCondicion(
    id: number,
    body: ICondicionClienteBody,
    extra: { clienteNombre: string; valorDescripcion: string } = { clienteNombre: "", valorDescripcion: "" }
  ): Observable<IResponse<ICondicionCliente | null>> {
    if (CondicionClienteApiService.BACKEND_DISPONIBLE) {
      return this._http.put<IResponse<ICondicionCliente | null>>(`${URL_CONDICION}/${id}`, body);
    }
    return this._guardarMock(id, body, extra);
  }

  deleteCondicion(id: number): Observable<IResponse<number>> {
    if (CondicionClienteApiService.BACKEND_DISPONIBLE) {
      return this._http.delete<IResponse<number>>(`${URL_CONDICION}/${id}`);
    }
    const antes = this._store.condiciones.length;
    this._store.condiciones = this._store.condiciones.filter((c) => c.ID !== id);
    const borradas = antes - this._store.condiciones.length;
    return of({
      success: borradas > 0,
      errors: borradas ? [] : ["No existe la condición"],
      result: borradas,
    }).pipe(delay(LATENCIA_MOCK));
  }

  /** Cuerpo de PUT a partir de una fila (para activar/desactivar sin abrir el formulario). */
  static aCuerpo(c: ICondicionCliente): ICondicionClienteBody {
    return {
      cliente: c.CLIENTE,
      alcance: c.ALCANCE,
      valor: c.VALOR,
      descuentoMax: c.DESCUENTO_MAX,
      precioEspecial: c.PRECIO_ESPECIAL,
      cantidadMin: c.CANTIDAD_MIN,
      fechaInicio: c.FECHA_INICIO,
      fechaFin: c.FECHA_FIN,
      activa: c.ACTIVA,
      notas: c.NOTAS,
    };
  }

  private _guardarMock(
    id: number | null,
    cuerpo: ICondicionClienteBody,
    extra: { clienteNombre: string; valorDescripcion: string }
  ): Observable<IResponse<ICondicionCliente | null>> {
    const body: ICondicionClienteBody = {
      ...cuerpo,
      valor: cuerpo.alcance === "T" ? cuerpo.valor.trim().toUpperCase() : cuerpo.valor.trim(),
    };
    const errores = validarCondicion(body, this._store.condiciones, id);
    if (errores.length) {
      return of({ success: false, errors: errores, result: null }).pipe(delay(LATENCIA_MOCK));
    }
    const previa = id != null ? this._store.condiciones.find((c) => c.ID === id) : undefined;
    if (id != null && !previa) {
      return of({ success: false, errors: ["No existe la condición"], result: null });
    }
    return this._catalogos.getCartera().pipe(
      map((cartera) => {
        const info = cartera.get(body.cliente);
        const valorDescripcion =
          body.alcance === "T"
            ? body.valor
            : body.alcance === "L"
            ? LINEAS_MOCK.find((l) => l.codigo === body.valor)?.nombre || extra.valorDescripcion || body.valor
            : extra.valorDescripcion || previa?.VALOR_DESCRIPCION || body.valor;
        const mismoCliente = previa && previa.CLIENTE === body.cliente;
        const fila: ICondicionCliente = {
          ID: previa?.ID ?? this._store.siguienteIdCondicion(),
          CLIENTE: body.cliente,
          CLIENTE_NOMBRE: extra.clienteNombre || (mismoCliente ? previa!.CLIENTE_NOMBRE : "") || body.cliente,
          ALCANCE: body.alcance,
          VALOR: body.valor,
          VALOR_DESCRIPCION: valorDescripcion,
          DESCUENTO_MAX: body.descuentoMax,
          PRECIO_ESPECIAL: body.precioEspecial,
          CANTIDAD_MIN: body.cantidadMin,
          FECHA_INICIO: body.fechaInicio,
          FECHA_FIN: body.fechaFin || null,
          ACTIVA: body.activa,
          NOTAS: body.notas || null,
          ESTADO: estadoRegla(body.activa, body.fechaInicio, body.fechaFin, hoyIso()),
          RUTAS: info ? info.rutas.join(", ") : mismoCliente ? previa!.RUTAS : "",
          AGENTE: info?.agente ?? (mismoCliente ? previa!.AGENTE : null),
          AGENTE_NOMBRE: info?.agenteNombre ?? (mismoCliente ? previa!.AGENTE_NOMBRE : null),
          EN_CARTERA: info ? info.rutas.length > 0 : mismoCliente ? previa!.EN_CARTERA : false,
          USUARIO_CREACION: previa?.USUARIO_CREACION ?? "demo",
          FECHA_CREACION: previa?.FECHA_CREACION ?? new Date().toISOString(),
        };
        this._store.condiciones = previa
          ? this._store.condiciones.map((c) => (c.ID === fila.ID ? fila : c))
          : [...this._store.condiciones, fila];
        return { success: true, errors: [], result: fila };
      })
    );
  }
}
