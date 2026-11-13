import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { delay, map, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import { hoyIso } from "../../../reportes/shared/reporte-utils";
import {
  estadoRegla,
  IFiltroPromocion,
  IPromocion,
  IPromocionBody,
  LINEAS_MOCK,
  TIPOS_CLIENTE_MOCK,
  validarPromocion,
} from "../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { CatalogosComercialesService } from "../../condiciones-comerciales-shared/catalogos-comerciales.service";
import { CondicionesMockStoreService } from "../../condiciones-comerciales-shared/condiciones-mock-store.service";
import { paramsDe, todasLasPaginas } from "../../condiciones-comerciales-shared/paginas";

const URL_PROMOCION = environment.host + "/fr/promocion";
const LATENCIA_MOCK = 150;

/** Fila de GET /fr/promocion: columnas de FR_PROMOCION + productos y destinos sin descripciones. */
interface IFilaPromocionBackend {
  ID: number;
  TITULO: string;
  DESCRIPCION: string | null;
  TIPO: "D" | "P" | "B";
  FECHA_INICIO: string;
  FECHA_FIN: string;
  DESTINO: "T" | "R" | "K" | "C";
  ARTICULO_BONIFICADO: string | null;
  CANTIDAD_BONIFICADA: number | string | null;
  ACTIVA: string;
  productos?: {
    ID: number;
    ALCANCE: "A" | "L" | "T";
    VALOR: string;
    CANTIDAD_MIN: number | string | null;
    DESCUENTO: number | string | null;
    PRECIO_ESPECIAL: number | string | null;
  }[];
  destinos?: { TIPO: "R" | "K" | "C"; VALOR: string }[];
}

/** DECIMAL de SQL Server llega como texto. */
const numONull = (v: number | string | null | undefined): number | null =>
  v === null || v === undefined || v === "" ? null : Number(v);
const soloFecha = (v: string | null | undefined): string => (v ? String(v).slice(0, 10) : "");
const todos = <T>(obs: Observable<T>[]): Observable<T[]> => (obs.length ? forkJoin(obs) : of([] as T[]));

/**
 * Promociones y descuentos de temporada (FR_PROMOCION + FR_PROMOCION_PRODUCTO +
 * FR_PROMOCION_DESTINO). El backend devuelve códigos; aquí se agregan descripciones y estado.
 * Con BACKEND_DISPONIBLE = false usa CondicionesMockStoreService.
 */
@Injectable({
  providedIn: "root",
})
export class PromocionApiService {
  static readonly BACKEND_DISPONIBLE: boolean = true;

  constructor(
    private _http: HttpClient,
    private _store: CondicionesMockStoreService,
    private _catalogos: CatalogosComercialesService
  ) {}

  getPromociones(filtro: IFiltroPromocion = {}): Observable<IPromocion[]> {
    const fecha = filtro.fecha || hoyIso();
    const q = (filtro.q ?? "").trim().toUpperCase();
    const filtrar = (lista: IPromocion[]) =>
      lista
        .filter((p) => !filtro.estado || p.ESTADO === filtro.estado)
        .filter((p) => !filtro.tipo || p.TIPO === filtro.tipo)
        .filter((p) => !q || p.TITULO.toUpperCase().includes(q));
    if (PromocionApiService.BACKEND_DISPONIBLE) {
      return todasLasPaginas<IFilaPromocionBackend>(this._http, URL_PROMOCION, paramsDe({ tipo: filtro.tipo })).pipe(
        switchMap((filas) => this._completar(filas, fecha)),
        map(filtrar)
      );
    }
    return of(filtrar(this._store.promociones.map((p) => this._conEstado(p, fecha)))).pipe(delay(LATENCIA_MOCK));
  }

  getPromocion(id: number): Observable<IResponse<IPromocion | null>> {
    if (PromocionApiService.BACKEND_DISPONIBLE) {
      return this._http
        .get<IResponse<IFilaPromocionBackend | null>>(`${URL_PROMOCION}/${id}`)
        .pipe(switchMap((r) => this._completarRespuesta(r)));
    }
    const p = this._store.promociones.find((x) => x.ID === id);
    return of({
      success: !!p,
      errors: p ? [] : ["No existe la promoción"],
      result: p ? this._conEstado(p, hoyIso()) : null,
    });
  }

  createPromocion(body: IPromocionBody): Observable<IResponse<IPromocion | null>> {
    if (PromocionApiService.BACKEND_DISPONIBLE) {
      return this._http
        .post<IResponse<IFilaPromocionBackend | null>>(URL_PROMOCION, this._limpio(body))
        .pipe(switchMap((r) => this._completarRespuesta(r)));
    }
    return this._guardarMock(null, body);
  }

  updatePromocion(id: number, body: IPromocionBody): Observable<IResponse<IPromocion | null>> {
    if (PromocionApiService.BACKEND_DISPONIBLE) {
      return this._http
        .put<IResponse<IFilaPromocionBackend | null>>(`${URL_PROMOCION}/${id}`, this._limpio(body))
        .pipe(switchMap((r) => this._completarRespuesta(r)));
    }
    return this._guardarMock(id, body);
  }

  deletePromocion(id: number): Observable<IResponse<number>> {
    if (PromocionApiService.BACKEND_DISPONIBLE) {
      return this._http.delete<IResponse<number>>(`${URL_PROMOCION}/${id}`);
    }
    const antes = this._store.promociones.length;
    this._store.promociones = this._store.promociones.filter((p) => p.ID !== id);
    const borradas = antes - this._store.promociones.length;
    return of({
      success: borradas > 0,
      errors: borradas ? [] : ["No existe la promoción"],
      result: borradas,
    }).pipe(delay(LATENCIA_MOCK));
  }

  /** Cuerpo de PUT/POST a partir de una fila (para duplicar o activar/desactivar). */
  static aCuerpo(p: IPromocion): IPromocionBody {
    return {
      titulo: p.TITULO,
      descripcion: p.DESCRIPCION,
      tipo: p.TIPO,
      fechaInicio: p.FECHA_INICIO,
      fechaFin: p.FECHA_FIN,
      destino: p.DESTINO,
      articuloBonificado: p.ARTICULO_BONIFICADO,
      cantidadBonificada: p.CANTIDAD_BONIFICADA,
      activa: p.ACTIVA,
      articuloBonificadoDescripcion: p.ARTICULO_BONIFICADO_DESCRIPCION ?? undefined,
      productos: p.productos.map((x) => ({
        alcance: x.ALCANCE,
        valor: x.VALOR,
        cantidadMin: x.CANTIDAD_MIN,
        descuento: x.DESCUENTO,
        precioEspecial: x.PRECIO_ESPECIAL,
        valorDescripcion: x.VALOR_DESCRIPCION,
      })),
      destinos: p.destinos.map((d) => ({ tipo: d.TIPO, valor: d.VALOR, descripcion: d.DESCRIPCION })),
    };
  }

  /** Respuesta de un GET/POST/PUT de una promoción, ya completa. */
  private _completarRespuesta(r: IResponse<IFilaPromocionBackend | null>): Observable<IResponse<IPromocion | null>> {
    if (!r.success || !r.result || !r.result.ID) return of({ ...r, result: null });
    return this._completar([r.result], hoyIso()).pipe(map(([p]) => ({ ...r, result: p })));
  }

  /** Agrega descripciones (líneas, artículos, rutas, tipos de cliente, clientes) y el estado. */
  private _completar(filas: IFilaPromocionBackend[], fecha: string): Observable<IPromocion[]> {
    if (!filas.length) return of([]);
    const valores = new Set<string>();
    const articulos = new Set<string>();
    const clientes = new Set<string>();
    filas.forEach((p) => {
      (p.productos || []).forEach((x) => valores.add(`${x.ALCANCE}|${String(x.VALOR).trim()}`));
      if (p.ARTICULO_BONIFICADO) articulos.add(String(p.ARTICULO_BONIFICADO).trim());
      (p.destinos || []).filter((d) => d.TIPO === "C").forEach((d) => clientes.add(String(d.VALOR).trim()));
    });
    const lv = [...valores];
    const la = [...articulos];
    const lc = [...clientes];
    return forkJoin({
      valores: todos(lv.map((v) => this._catalogos.describirValor(v.slice(0, 1), v.slice(2)))),
      bonificados: todos(la.map((a) => this._catalogos.describirValor("A", a))),
      clientes: todos(lc.map((c) => this._catalogos.nombreCliente(c))),
      rutas: this._catalogos.getRutas(),
      tipos: this._catalogos.getTiposCliente(),
    }).pipe(
      map(({ valores: dv, bonificados, clientes: nc, rutas, tipos }) => {
        const descValor = new Map(lv.map((v, i) => [v, dv[i]]));
        const descArt = new Map(la.map((a, i) => [a, bonificados[i]]));
        const nomCliente = new Map(lc.map((c, i) => [c, nc[i]]));
        const descDestino = (tipo: string, valor: string): string =>
          (tipo === "R"
            ? rutas.find((r) => r.codigo === valor)?.nombre
            : tipo === "K"
            ? tipos.find((t) => t.codigo === valor)?.nombre
            : nomCliente.get(valor)) || valor;
        return filas.map((p): IPromocion => {
          const activa = p.ACTIVA === "N" ? "N" : "S";
          const inicio = soloFecha(p.FECHA_INICIO);
          const fin = soloFecha(p.FECHA_FIN);
          const bonificado = p.ARTICULO_BONIFICADO ? String(p.ARTICULO_BONIFICADO).trim() : null;
          return {
            ID: p.ID,
            TITULO: p.TITULO,
            DESCRIPCION: p.DESCRIPCION,
            TIPO: p.TIPO,
            FECHA_INICIO: inicio,
            FECHA_FIN: fin,
            DESTINO: p.DESTINO,
            ARTICULO_BONIFICADO: bonificado,
            ARTICULO_BONIFICADO_DESCRIPCION: bonificado ? descArt.get(bonificado) || bonificado : null,
            CANTIDAD_BONIFICADA: numONull(p.CANTIDAD_BONIFICADA),
            ACTIVA: activa,
            ESTADO: estadoRegla(activa, inicio, fin, fecha),
            productos: (p.productos || []).map((x) => {
              const valor = String(x.VALOR).trim();
              return {
                ID: x.ID,
                ALCANCE: x.ALCANCE,
                VALOR: valor,
                VALOR_DESCRIPCION: descValor.get(`${x.ALCANCE}|${valor}`) || valor,
                CANTIDAD_MIN: numONull(x.CANTIDAD_MIN),
                DESCUENTO: numONull(x.DESCUENTO),
                PRECIO_ESPECIAL: numONull(x.PRECIO_ESPECIAL),
              };
            }),
            destinos: (p.destinos || []).map((d) => {
              const valor = String(d.VALOR).trim();
              return { TIPO: d.TIPO, VALOR: valor, DESCRIPCION: descDestino(d.TIPO, valor) };
            }),
          };
        });
      })
    );
  }

  /** Quita los campos que solo usa el modo prueba (descripciones) antes de enviar al backend. */
  private _limpio(body: IPromocionBody): IPromocionBody {
    const { articuloBonificadoDescripcion: _a, ...resto } = body;
    return {
      ...resto,
      productos: body.productos.map(({ valorDescripcion: _v, ...p }) => p),
      destinos: body.destinos.map(({ descripcion: _d, ...d }) => d),
    };
  }

  private _conEstado(p: IPromocion, fecha: string): IPromocion {
    return {
      ...p,
      ESTADO: estadoRegla(p.ACTIVA, p.FECHA_INICIO, p.FECHA_FIN, fecha),
      productos: p.productos.map((x) => ({ ...x })),
      destinos: p.destinos.map((d) => ({ ...d })),
    };
  }

  private _guardarMock(id: number | null, body: IPromocionBody): Observable<IResponse<IPromocion | null>> {
    const errores = validarPromocion(body);
    const previa = id != null ? this._store.promociones.find((p) => p.ID === id) : undefined;
    if (id != null && !previa) errores.push("No existe la promoción");
    if (errores.length) {
      return of({ success: false, errors: errores, result: null }).pipe(delay(LATENCIA_MOCK));
    }
    const descripcionDestino = (tipo: string, valor: string, dada?: string) =>
      dada || (tipo === "K" ? TIPOS_CLIENTE_MOCK.find((t) => t.codigo === valor)?.nombre : undefined) || valor;
    const fila: IPromocion = {
      ID: previa?.ID ?? this._store.siguienteIdPromocion(),
      TITULO: body.titulo.trim(),
      DESCRIPCION: body.descripcion?.trim() || null,
      TIPO: body.tipo,
      FECHA_INICIO: body.fechaInicio,
      FECHA_FIN: body.fechaFin,
      DESTINO: body.destino,
      ARTICULO_BONIFICADO: body.tipo === "B" ? body.articuloBonificado : null,
      ARTICULO_BONIFICADO_DESCRIPCION:
        body.tipo === "B" ? body.articuloBonificadoDescripcion || body.articuloBonificado : null,
      CANTIDAD_BONIFICADA: body.tipo === "B" ? body.cantidadBonificada : null,
      ACTIVA: body.activa,
      ESTADO: estadoRegla(body.activa, body.fechaInicio, body.fechaFin, hoyIso()),
      productos: body.productos.map((x) => ({
        ID: this._store.siguienteIdProducto(),
        ALCANCE: x.alcance,
        VALOR: x.alcance === "T" ? x.valor.trim().toUpperCase() : x.valor.trim(),
        VALOR_DESCRIPCION:
          x.alcance === "L"
            ? LINEAS_MOCK.find((l) => l.codigo === x.valor)?.nombre || x.valor
            : x.alcance === "T"
            ? x.valor.trim().toUpperCase()
            : x.valorDescripcion || x.valor,
        CANTIDAD_MIN: x.cantidadMin,
        DESCUENTO: body.tipo === "D" ? x.descuento : null,
        PRECIO_ESPECIAL: body.tipo === "P" ? x.precioEspecial : null,
      })),
      destinos:
        body.destino === "T"
          ? []
          : body.destinos
              .filter((d) => d.tipo === body.destino)
              .map((d) => ({ TIPO: d.tipo, VALOR: d.valor, DESCRIPCION: descripcionDestino(d.tipo, d.valor, d.descripcion) })),
    };
    this._store.promociones = previa
      ? this._store.promociones.map((p) => (p.ID === fila.ID ? fila : p))
      : [...this._store.promociones, fila];
    return of({ success: true, errors: [], result: fila }).pipe(delay(LATENCIA_MOCK));
  }
}
