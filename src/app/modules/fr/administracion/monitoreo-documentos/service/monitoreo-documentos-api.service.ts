import { forkJoin, Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { ReportesFrApiService } from "../../../reportes/shared/reportes-fr-api.service";
import {
  IAgenteReporte,
  IRutaAsignadaReporte,
} from "../../../reportes/shared/reportes-fr-model-interface";
import {
  IFiltroMonitoreo,
  IFilaMonitoreo,
  TipoDocumentoMonitor,
} from "../model/monitoreo-documentos-model-interface";

interface IContextoMonitor {
  pasaFiltro: (ruta: string) => boolean;
  datosRuta: (ruta: string) => {
    AGENTE: string;
    AGENTE_NOMBRE: string;
    HANDHELD: string;
  };
}

/**
 * Datos del Monitor de Documentos. Hoy solo hay backend real para:
 *  - Rutas:   GET /fr/reporteVisita/resumen (jornada por ruta y día) + RUTA_ASIGNADA_RT (agente y
 *             handheld de la ruta) + AGENTE_ASOC_RT/vendedorErp (nombre del agente).
 *  - Pedidos: GET /fr/reporteVisita, visitas que registraron documento (VISITA.DOC_PRO). Cuando
 *             exista un endpoint de pedidos de FR (erpadmin.alFAC_ENC_PED) basta cambiar
 *             _getPedidos() por esa llamada; las columnas de la pestaña ya son las de un pedido.
 * Facturas, devoluciones, consignaciones, cobros, depósitos, garantías y traspasos no tienen
 * endpoint todavía: getDocumentos() devuelve lista vacía y la pantalla lo indica como
 * "pendiente backend".
 */
@Injectable({
  providedIn: "root",
})
export class MonitoreoDocumentosApiService {
  constructor(private _reportesApi: ReportesFrApiService) {}

  /** Tipos de documento que ya leen datos reales del backend. */
  readonly tiposConBackend: TipoDocumentoMonitor[] = ["rutas", "pedidos"];

  getDocumentos(
    tipo: TipoDocumentoMonitor,
    filtro: IFiltroMonitoreo,
    rutasAsignadas: IRutaAsignadaReporte[],
    agentes: IAgenteReporte[]
  ): Observable<IFilaMonitoreo[]> {
    const contexto = this._contexto(filtro, rutasAsignadas, agentes);
    switch (tipo) {
      case "rutas":
        return this._getRutas(filtro, contexto);
      case "pedidos":
        return this._getPedidos(filtro, contexto);
      default:
        return of([]);
    }
  }

  /** Cruza ruta -> (agente, handheld) y decide qué rutas pasan los filtros Handheld/Agente, que el
   *  backend de visitas no soporta (solo filtra por una ruta). */
  private _contexto(
    filtro: IFiltroMonitoreo,
    rutasAsignadas: IRutaAsignadaReporte[],
    agentes: IAgenteReporte[]
  ): IContextoMonitor {
    const asignada = new Map(
      rutasAsignadas.map((r) => [String(r.RUTA).trim(), r])
    );
    const nombreAgente = new Map(agentes.map((a) => [a.codigo, a.nombre]));
    const pasaFiltro = (ruta: string): boolean => {
      const a = asignada.get(String(ruta).trim());
      if (filtro.handheld && String(a?.HANDHELD ?? "").trim() !== filtro.handheld)
        return false;
      if (filtro.agente && String(a?.AGENTE ?? "").trim() !== filtro.agente)
        return false;
      return true;
    };
    const datosRuta = (ruta: string) => {
      const a = asignada.get(String(ruta).trim());
      const agente = String(a?.AGENTE ?? "").trim();
      return {
        AGENTE: agente,
        AGENTE_NOMBRE: nombreAgente.get(agente) ?? "",
        HANDHELD: String(a?.HANDHELD ?? "").trim(),
      };
    };
    return { pasaFiltro, datosRuta };
  }

  private _filtroVisita(filtro: IFiltroMonitoreo) {
    return {
      ruta: filtro.ruta || undefined,
      desde: filtro.fechaInicio || undefined,
      hasta: filtro.fechaFin || undefined,
    };
  }

  private _getRutas(
    filtro: IFiltroMonitoreo,
    ctx: IContextoMonitor
  ): Observable<IFilaMonitoreo[]> {
    return this._reportesApi
      .getResumenVisitas(this._filtroVisita(filtro), filtro.top)
      .pipe(
        map((filas) =>
          filas
            .filter((f) => ctx.pasaFiltro(f.RUTA))
            .map((f) => ({
              RUTA: f.RUTA,
              RUTA_DESCRIPCION: f.RUTA_DESCRIPCION ?? "",
              ...ctx.datosRuta(f.RUTA),
              // f.FECHA (CAST AS date) llega corrida un día por la zona horaria del driver;
              // la fecha se toma de PRIMERA_VISITA, que sí viene con hora completa.
              FECHA: f.PRIMERA_VISITA ?? f.FECHA,
              HORA_INICIO: f.PRIMERA_VISITA,
              HORA_FIN: f.ULTIMA_VISITA,
              TOTAL_VISITAS: f.TOTAL_VISITAS,
              CLIENTES_VISITADOS: f.CLIENTES_VISITADOS,
              VISITAS_CON_GPS: f.VISITAS_CON_GPS,
              DURACION_PROMEDIO_MIN: f.DURACION_PROMEDIO_MIN,
            }))
        )
      );
  }

  private _getPedidos(
    filtro: IFiltroMonitoreo,
    ctx: IContextoMonitor
  ): Observable<IFilaMonitoreo[]> {
    if (ReportesFrApiService.PEDIDOS_BACKEND_DISPONIBLE) {
      return forkJoin({
        pedidos: this._reportesApi.getPedidos(this._filtroVisita(filtro), filtro.top),
        visitas: this._reportesApi.getVisitas(this._filtroVisita(filtro)),
      }).pipe(
        map(({ pedidos, visitas }) => {
          const clave = (ruta: string, cliente: string) =>
            `${String(ruta).trim()}|${String(cliente).trim()}`;
          const nombre = new Map(
            visitas.map((v) => [String(v.CLIENTE).trim(), v.CLIENTE_NOMBRE ?? ""])
          );
          // Visita en la que se tomó el pedido: misma ruta+cliente con HOR_INI dentro de ella.
          const visitaDe = (ruta: string, cliente: string, hora: string) =>
            visitas.find(
              (v) =>
                clave(v.RUTA, v.CLIENTE) === clave(ruta, cliente) &&
                hora >= v.INICIO &&
                hora <= (v.FIN ?? v.INICIO)
            );
          return pedidos
            .filter((p) => ctx.pasaFiltro(p.COD_ZON))
            .map((p) => {
              const ruta = String(p.COD_ZON).trim();
              const cliente = String(p.COD_CLT).trim();
              const visita = visitaDe(ruta, cliente, p.HOR_INI ?? p.FEC_PED);
              return {
                RUTA: ruta,
                RUTA_DESCRIPCION: p.RUTA_DESCRIPCION ?? visita?.RUTA_DESCRIPCION ?? "",
                ...ctx.datosRuta(ruta),
                PEDIDO: String(p.NUM_PED).trim(),
                CLIENTE: cliente,
                CLIENTE_NOMBRE: p.CLIENTE_NOMBRE ?? nombre.get(cliente) ?? "",
                FECHA: p.HOR_INI ?? p.FEC_PED,
                HORA_INICIO: p.HOR_INI,
                HORA_FIN: p.HOR_FIN,
                TOTAL: p.MON_CIV,
                RAZON: visita?.RAZON_DESCRIPCION ?? visita?.RAZON ?? "",
                NOTAS: visita?.NOTAS ?? "",
              };
            });
        })
      );
    }
    return this._reportesApi
      .getVisitas(this._filtroVisita(filtro), filtro.top)
      .pipe(
        map((visitas) =>
          visitas
            .filter((v) => String(v.DOC_PRO ?? "").trim() !== "")
            .filter((v) => ctx.pasaFiltro(v.RUTA))
            .map((v) => ({
              RUTA: v.RUTA,
              RUTA_DESCRIPCION: v.RUTA_DESCRIPCION ?? "",
              ...ctx.datosRuta(v.RUTA),
              PEDIDO: String(v.DOC_PRO).trim(),
              CLIENTE: v.CLIENTE,
              CLIENTE_NOMBRE: v.CLIENTE_NOMBRE ?? "",
              FECHA: v.INICIO,
              HORA_INICIO: v.INICIO,
              HORA_FIN: v.FIN,
              RAZON: v.RAZON_DESCRIPCION ?? v.RAZON ?? "",
              NOTAS: v.NOTAS ?? "",
            }))
        )
      );
  }

  /** Catálogos para los filtros y para cruzar agente/handheld de cada ruta. */
  getCatalogos(): Observable<{
    rutasAsignadas: IRutaAsignadaReporte[];
    agentes: IAgenteReporte[];
  }> {
    return forkJoin({
      rutasAsignadas: this._reportesApi.getRutasAsignadas(),
      agentes: this._reportesApi.getAgentes(),
    });
  }
}
