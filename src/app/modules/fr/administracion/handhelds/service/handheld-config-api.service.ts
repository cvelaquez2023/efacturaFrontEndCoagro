import { Observable, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import {
  HANDHELD_CONFIG_DEFAULT,
  IHandheldConfig,
} from "../model/handheld-config-model";

// Backend: routes/fr/configHh.js -> erpadmin.CONFIG_HH (PK HANDHELD + CONSTANTE). La app móvil
// descarga todas las filas de su handheld con GET /fr/sync/configuracion.
const URL_CONFIG_HH = environment.host + "/fr/configHh";

/** Fila de CONFIG_HH donde se guarda la "Configuración General" de cada handheld. */
export const CONSTANTE_CONFIG_GENERAL = "CONFIG_GENERAL";

/** Fila tal como la devuelve el backend (columnas reales). */
interface IConfigHhRow {
  HANDHELD: string;
  CONSTANTE: string;
  VALOR: string | null;
  SIMBOLO_MONEDA: string | null;
  NOMBRE_ARCHIVO_BITACORA: string | null;
  REGISTRO_MULTIPLE_DOCUMENTO: string | null;
  CANTIDAD_DECIMALES: number | null;
  TAMANO_LETRA_WM: number | null;
  DECIMALES_UNIDADES: number | null;
  LIMPIADO_FILTRO_ARTICULOS_ANDROID: string | null;
  INFORMACION_DESCUENTOS_VENCIDA: string | null;
  SELECCION_AUTOMATICA_CLIENTE_WM: string | null;
  BUSQUEDA_AGIL_CLIENTE_WM: string | null;
  ORDENAR_ARTICULO_CRITERIO_WM: string | null;
  ORDENAR_ARTICULO_INDICE_WM: string | null;
  ADVERTIR_ACTUALIZACION: string | null;
  PURGA_AUTOMATICA: string | null;
  PURGA_MANUAL: string | null;
  PURGA_CANTIDAD_DIAS: number | null;
  GPS_UBICACION_VISITA: boolean | number | null;
  GPS_UBICACION_CLIENTE: boolean | number | null;
  GPS_ACTUALIZAR_UBICACION_CLIENTE: boolean | number | null;
  GPS_NO_DETENER_PROCESO_WM: boolean | number | null;
  GPS_DISTANCIA_M: number | string | null;
}

// char(1) 'S'/'N' <-> boolean
const sn = (v: boolean): string => (v ? "S" : "N");
const deSn = (v: string | null | undefined, porDefecto: boolean): boolean =>
  v == null || v === "" ? porDefecto : v.toUpperCase() === "S";
// bit (true/false o 1/0) <-> boolean
const deBit = (v: boolean | number | null | undefined, porDefecto: boolean): boolean =>
  v == null ? porDefecto : v === true || v === 1;
const num = (v: number | string | null | undefined, porDefecto: number): number => {
  const n = Number(v);
  return v == null || v === "" || !Number.isFinite(n) ? porDefecto : n;
};

@Injectable({
  providedIn: "root",
})
export class HandheldConfigApiService {
  constructor(private _httpClient: HttpClient) {}

  private _url(handheld: string): string {
    return `${URL_CONFIG_HH}/${encodeURIComponent(handheld)}/${CONSTANTE_CONFIG_GENERAL}`;
  }

  /** Configuración guardada de la handheld; si no tiene fila, los valores por defecto. */
  get(handheld: string): Observable<IHandheldConfig> {
    return this._httpClient.get<IResponse<IConfigHhRow | null>>(this._url(handheld)).pipe(
      map((resp) =>
        resp.success && resp.result && resp.result.HANDHELD
          ? this._aModelo(resp.result)
          : { ...HANDHELD_CONFIG_DEFAULT }
      )
    );
  }

  /** Crea o actualiza la fila CONFIG_GENERAL de la handheld (la handheld ya debe existir). */
  save(handheld: string, config: IHandheldConfig): Observable<IResponse<unknown>> {
    const body = this._aBody(config);
    return this._httpClient.get<IResponse<IConfigHhRow | null>>(this._url(handheld)).pipe(
      switchMap((actual) =>
        actual.success && actual.result && actual.result.HANDHELD
          ? this._httpClient.put<IResponse<unknown>>(this._url(handheld), body)
          : this._httpClient.post<IResponse<unknown>>(URL_CONFIG_HH, {
              handheld,
              constante: CONSTANTE_CONFIG_GENERAL,
              ...body,
            })
      )
    );
  }

  /** Borra la configuración de la handheld (al eliminarla). Los errores se ignoran. */
  remove(handheld: string): Observable<unknown> {
    return this._httpClient
      .delete<IResponse<number>>(this._url(handheld))
      .pipe(catchError(() => of(null)));
  }

  private _aModelo(r: IConfigHhRow): IHandheldConfig {
    const d = HANDHELD_CONFIG_DEFAULT;
    return {
      simboloMonetario: r.SIMBOLO_MONEDA ?? d.simboloMonetario,
      nombreArchivoBitacora: r.NOMBRE_ARCHIVO_BITACORA ?? d.nombreArchivoBitacora,
      registroMultipleDocumento:
        (r.REGISTRO_MULTIPLE_DOCUMENTO || "").toUpperCase() === "N" ? "N" : "S",
      cantidadDecimales: num(r.CANTIDAD_DECIMALES, d.cantidadDecimales),
      tamanoLetra: num(r.TAMANO_LETRA_WM, d.tamanoLetra),
      decimalesUnidades: num(r.DECIMALES_UNIDADES, d.decimalesUnidades),

      limpiarFiltroArticulos: deSn(r.LIMPIADO_FILTRO_ARTICULOS_ANDROID, d.limpiarFiltroArticulos),
      infoDescuentosVencida: deSn(r.INFORMACION_DESCUENTOS_VENCIDA, d.infoDescuentosVencida),
      seleccionAutomaticaCliente: deSn(r.SELECCION_AUTOMATICA_CLIENTE_WM, d.seleccionAutomaticaCliente),
      busquedaAgilCliente: deSn(r.BUSQUEDA_AGIL_CLIENTE_WM, d.busquedaAgilCliente),
      ordenarArticuloCriterio: deSn(r.ORDENAR_ARTICULO_CRITERIO_WM, d.ordenarArticuloCriterio),
      ordenarArticuloIndice: deSn(r.ORDENAR_ARTICULO_INDICE_WM, d.ordenarArticuloIndice),
      advertirActualizacion: deSn(r.ADVERTIR_ACTUALIZACION, d.advertirActualizacion),

      purgaAutomatica: deSn(r.PURGA_AUTOMATICA, d.purgaAutomatica),
      purgaManual: deSn(r.PURGA_MANUAL, d.purgaManual),
      purgaDias: num(r.PURGA_CANTIDAD_DIAS, d.purgaDias),

      gpsUbicacionVisita: deBit(r.GPS_UBICACION_VISITA, d.gpsUbicacionVisita),
      gpsUbicacionCliente: deBit(r.GPS_UBICACION_CLIENTE, d.gpsUbicacionCliente),
      gpsActualizarUbicacionCliente: deBit(
        r.GPS_ACTUALIZAR_UBICACION_CLIENTE,
        d.gpsActualizarUbicacionCliente
      ),
      gpsNoDetenerProceso: deBit(r.GPS_NO_DETENER_PROCESO_WM, d.gpsNoDetenerProceso),
      gpsDistancia: num(r.GPS_DISTANCIA_M, d.gpsDistancia),
    };
  }

  /** Body en camelCase, como lo espera controllers/fr/configHh.js (dbAJs). */
  private _aBody(c: IHandheldConfig): Record<string, unknown> {
    return {
      valor: "S",
      simboloMoneda: c.simboloMonetario,
      nombreArchivoBitacora: c.nombreArchivoBitacora,
      registroMultipleDocumento: c.registroMultipleDocumento,
      cantidadDecimales: c.cantidadDecimales,
      tamanoLetraWm: c.tamanoLetra,
      decimalesUnidades: c.decimalesUnidades,
      limpiadoFiltroArticulosAndroid: sn(c.limpiarFiltroArticulos),
      informacionDescuentosVencida: sn(c.infoDescuentosVencida),
      seleccionAutomaticaClienteWm: sn(c.seleccionAutomaticaCliente),
      busquedaAgilClienteWm: sn(c.busquedaAgilCliente),
      ordenarArticuloCriterioWm: sn(c.ordenarArticuloCriterio),
      ordenarArticuloIndiceWm: sn(c.ordenarArticuloIndice),
      advertirActualizacion: sn(c.advertirActualizacion),
      purgaAutomatica: sn(c.purgaAutomatica),
      purgaManual: sn(c.purgaManual),
      purgaCantidadDias: c.purgaDias,
      gpsUbicacionVisita: c.gpsUbicacionVisita,
      gpsUbicacionCliente: c.gpsUbicacionCliente,
      gpsActualizarUbicacionCliente: c.gpsActualizarUbicacionCliente,
      gpsNoDetenerProcesoWm: c.gpsNoDetenerProceso,
      gpsDistanciaM: c.gpsDistancia,
    };
  }
}
