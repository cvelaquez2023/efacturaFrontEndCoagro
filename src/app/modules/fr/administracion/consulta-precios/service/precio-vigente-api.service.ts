import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import { CatalogosComercialesService } from "../../condiciones-comerciales-shared/catalogos-comerciales.service";
import {
  calcularPrecioVigente,
  IReglaCandidata,
  IVA,
  IFiltroPrecio,
  IPrecioVigente,
} from "../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { paramsDe } from "../../condiciones-comerciales-shared/paginas";
import { CondicionClienteApiService } from "../../condiciones-cliente/service/condicion-cliente-api.service";
import { PromocionApiService } from "../../promociones/service/promocion-api.service";

const URL_PRECIO_VIGENTE = environment.host + "/fr/precioVigente";

/** Respuesta de GET /fr/precioVigente (utils/precioFr.js, camelCase). */
interface IReglaBackend {
  origen: "CONDICION" | "PROMOCION";
  id: number;
  descripcion: string;
  precio: number;
  descuento?: number;
}
interface IPrecioBackend {
  cliente: string | null;
  articulo: string;
  descripcion: string;
  linea: string | null;
  nivelPrecio: string | null;
  fecha: string;
  precioBase: number | null;
  precioFinal: number | null;
  reglaAplicada: IReglaBackend | null;
  candidatas: IReglaBackend[];
  bonificaciones: {
    promocionId: number;
    titulo: string;
    cantidadMin: number | null;
    articuloBonificado: string | null;
    cantidadBonificada: number | null;
  }[];
  avisos?: string[];
}

const aRegla = (r: IReglaBackend): IReglaCandidata => ({
  ORIGEN: r.origen,
  ID: r.id,
  DESCRIPCION: r.descripcion,
  DESCUENTO: r.descuento ?? null,
  PRECIO_ESPECIAL: r.descuento == null ? r.precio : null,
  PRECIO_RESULTANTE: r.precio,
});
const redondear2 = (v: number): number => Math.round(v * 100) / 100;

/** Datos que el modo prueba necesita y que el backend resuelve solo (descripción, línea, precio). */
export interface IContextoPrecioMock {
  articuloDescripcion: string;
  linea: string | null;
  precioBase: number;
}

/**
 * Consulta de precio vigente (spec §5.4). Con BACKEND_DISPONIBLE = false calcula en el navegador
 * con el mismo algoritmo (calcularPrecioVigente) sobre las condiciones y promociones de prueba; el
 * precio base sale de la tabla de prueba PRECIOS_BASE_MOCK o del que escriba el usuario.
 */
@Injectable({
  providedIn: "root",
})
export class PrecioVigenteApiService {
  static readonly BACKEND_DISPONIBLE: boolean = true;

  constructor(
    private _http: HttpClient,
    private _condiciones: CondicionClienteApiService,
    private _promociones: PromocionApiService,
    private _catalogos: CatalogosComercialesService
  ) {}

  getPrecioVigente(
    filtro: IFiltroPrecio,
    contexto: IContextoPrecioMock
  ): Observable<IResponse<IPrecioVigente | null>> {
    if (PrecioVigenteApiService.BACKEND_DISPONIBLE) {
      // Las rutas del cliente se envían para que apliquen las promociones dirigidas a rutas.
      return this._catalogos.getCartera().pipe(
        switchMap((cartera) =>
          this._http.get<IResponse<IPrecioBackend | null>>(URL_PRECIO_VIGENTE, {
            params: paramsDe({ ...filtro, ruta: (cartera.get(filtro.cliente)?.rutas ?? []).join(",") }),
          })
        ),
        switchMap((r) => this._adaptar(r, filtro))
      );
    }
    return this._calcularMock(filtro, contexto);
  }

  private _adaptar(r: IResponse<IPrecioBackend | null>, filtro: IFiltroPrecio): Observable<IResponse<IPrecioVigente | null>> {
    const d = r.result;
    if (!r.success || !d || !d.articulo) return of({ ...r, result: null });
    const bonificados = [...new Set(d.bonificaciones.map((b) => b.articuloBonificado).filter((a): a is string => !!a))];
    const descripciones = bonificados.length
      ? forkJoin(bonificados.map((a) => this._catalogos.describirValor("A", a)))
      : of([] as string[]);
    return descripciones.pipe(
      map((desc) => {
        const descDe = new Map(bonificados.map((a, i) => [a, desc[i]]));
        const base = d.precioBase ?? 0;
        const final = d.precioFinal ?? base;
        return {
          ...r,
          result: {
            CLIENTE: d.cliente ?? filtro.cliente,
            ARTICULO: d.articulo,
            ARTICULO_DESCRIPCION: d.descripcion,
            LINEA: d.linea ? String(d.linea).trim() : null,
            NIVEL_PRECIO: d.nivelPrecio,
            FECHA: d.fecha,
            PRECIO_BASE: base,
            IVA,
            PRECIO_FINAL: final,
            PRECIO_FINAL_IVA: redondear2(final * (1 + IVA)),
            REGLA_APLICADA: d.reglaAplicada ? aRegla(d.reglaAplicada) : null,
            REGLAS_CANDIDATAS: d.candidatas.map(aRegla),
            BONIFICACIONES: d.bonificaciones.map((b) => ({
              PROMOCION_ID: b.promocionId,
              DESCRIPCION: b.titulo,
              CANTIDAD_MIN: b.cantidadMin,
              ARTICULO: b.articuloBonificado,
              ARTICULO_DESCRIPCION: b.articuloBonificado ? descDe.get(b.articuloBonificado) ?? null : null,
              CANTIDAD: b.cantidadBonificada,
            })),
            AVISOS: d.avisos ?? [],
          },
        };
      })
    );
  }

  private _calcularMock(filtro: IFiltroPrecio, contexto: IContextoPrecioMock): Observable<IResponse<IPrecioVigente | null>> {
    return forkJoin({
      condiciones: this._condiciones.getCondiciones({ cliente: filtro.cliente, fecha: filtro.fecha }),
      promociones: this._promociones.getPromociones({ fecha: filtro.fecha }),
      cartera: this._catalogos.getCartera(),
    }).pipe(
      map(({ condiciones, promociones, cartera }) => ({
        success: true,
        errors: [],
        result: calcularPrecioVigente({
          cliente: {
            codigo: filtro.cliente,
            rutas: cartera.get(filtro.cliente)?.rutas ?? [],
            // Tipo de cliente (CLIENTE_CIA.COD_TIP_CL) no se lee en modo prueba.
            tipo: null,
          },
          articulo: {
            codigo: filtro.articulo,
            descripcion: contexto.articuloDescripcion,
            linea: contexto.linea,
          },
          precioBase: contexto.precioBase,
          fecha: filtro.fecha,
          cantidad: filtro.cantidad ?? null,
          condiciones,
          promociones,
          nivelPrecio: "(prueba)",
        }),
      }))
    );
  }
}
