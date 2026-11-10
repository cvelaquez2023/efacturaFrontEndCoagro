import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { ReportesFrApiService } from "../../shared/reportes-fr-api.service";
import {
  EstadoBitacora,
  IAgenteReporte,
  IBitacoraSincronizacion,
  IPedidoReporte,
  IReporteVisita,
  IRutaAsignadaReporte,
} from "../../shared/reportes-fr-model-interface";
import { sumarDias } from "../../shared/reporte-utils";

/** Tope de visitas a leer del backend para un rango de fechas. */
const TOP_VISITAS = 60000;
/** FEC_PED puede no coincidir con el día de la visita (se ha visto hasta una semana de
 *  diferencia): los pedidos se piden con este margen y luego se emparejan por hora. */
const MARGEN_DIAS_PEDIDOS = 30;

/** VISITA.TIPO: R = visita de la ruta planificada; el resto se muestra con su código. */
const TIPOS_VISITA: Record<string, string> = {
  R: "En ruta",
  F: "Fuera de ruta",
};

const limpio = (v: unknown): string => String(v ?? "").trim();
const clave = (ruta: unknown, cliente: unknown): string => `${limpio(ruta)}|${limpio(cliente)}`;

/**
 * Bitácora de Sincronización (manual FRd pág. 76). Fuente: erpadmin.VISITA vía GET
 * /fr/reporteVisita (la misma tabla que Histórico de Visitas). La handheld y el agente salen de la
 * asignación de la ruta (RUTA_ASIGNADA_RT).
 *
 * Status: se cruza cada visita con los documentos que generó en erpadmin.alFAC_ENC_PED
 * (GET /fr/pedido). DOC_PRO = 'S' -> "Enviado al ERP"; null -> "Pendiente de envío". Si la visita
 * no generó documento el status queda vacío.
 */
@Injectable({
  providedIn: "root",
})
export class BitacoraSincronizacionApiService {
  constructor(private _reportesApi: ReportesFrApiService) {}

  getBitacora(desde: string, hasta: string): Observable<IBitacoraSincronizacion[]> {
    return forkJoin({
      visitas: this._reportesApi.getVisitas({ desde, hasta }, TOP_VISITAS),
      pedidos: this._reportesApi
        .getPedidos({
          desde: sumarDias(desde, -MARGEN_DIAS_PEDIDOS),
          hasta: sumarDias(hasta, MARGEN_DIAS_PEDIDOS),
        })
        .pipe(catchError(() => of([] as IPedidoReporte[]))),
      // Si no cargan agentes/asignaciones la bitácora igual se muestra (sin esas columnas).
      rutas: this._reportesApi
        .getRutasAsignadas()
        .pipe(catchError(() => of([] as IRutaAsignadaReporte[]))),
      agentes: this._reportesApi
        .getAgentes()
        .pipe(catchError(() => of([] as IAgenteReporte[]))),
    }).pipe(
      map(({ visitas, pedidos, rutas, agentes }) => {
        const asignacion = new Map(rutas.map((r) => [limpio(r.RUTA), r]));
        const nombreAgente = new Map(agentes.map((a) => [a.codigo, a.nombre]));
        const pedidosPorCliente = new Map<string, IPedidoReporte[]>();
        pedidos.forEach((p) => {
          const k = clave(p.COD_ZON, p.COD_CLT);
          pedidosPorCliente.set(k, [...(pedidosPorCliente.get(k) ?? []), p]);
        });
        return visitas.map((v) =>
          this._fila(v, asignacion, nombreAgente, pedidosPorCliente.get(clave(v.RUTA, v.CLIENTE)) ?? [])
        );
      })
    );
  }

  /** Documentos de la visita: los de la misma ruta+cliente con HOR_INI entre INICIO y FIN; si
   *  no hay, el número que la handheld anotó en NOTAS (si existe para esa ruta+cliente). */
  private _documentosDeVisita(v: IReporteVisita, candidatos: IPedidoReporte[]): IPedidoReporte[] {
    const inicio = v.INICIO;
    const fin = v.FIN && v.FIN > v.INICIO ? v.FIN : v.INICIO;
    const porHora = candidatos.filter(
      (p) => !!p.HOR_INI && p.HOR_INI >= inicio && p.HOR_INI <= fin
    );
    if (porHora.length) return porHora;
    const notas = limpio(v.NOTAS).toUpperCase();
    return notas
      ? candidatos.filter((p) => {
          const num = limpio(p.NUM_PED).toUpperCase();
          return !!num && new RegExp(`(^|\\s)${num.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`).test(notas);
        })
      : [];
  }

  private _fila(
    v: IReporteVisita,
    asignacion: Map<string, IRutaAsignadaReporte>,
    nombreAgente: Map<string, string>,
    candidatos: IPedidoReporte[]
  ): IBitacoraSincronizacion {
    const ruta = limpio(v.RUTA);
    const asig = asignacion.get(ruta);
    const agente = limpio(asig?.AGENTE);
    const tipo = limpio(v.TIPO).toUpperCase();
    const docs = this._documentosDeVisita(v, candidatos);

    let estado: EstadoBitacora = "";
    if (docs.length) {
      const todosEnviados = docs.every((d) => limpio(d.DOC_PRO).toUpperCase() === "S");
      estado = todosEnviados ? "Enviado al ERP" : "Pendiente de envío";
    }
    // El proceso se arma con los documentos reales (más confiable que NOTAS).
    const proceso = docs.length
      ? docs
          .map((d) => `${limpio(d.TIP_DOC).toUpperCase() === "C" ? "Cotización" : "Pedido"} ${limpio(d.NUM_PED)}`)
          .join(", ")
      : limpio(v.NOTAS) || v.RAZON_DESCRIPCION || v.RAZON || "Visita";

    return {
      ruta,
      rutaNombre: v.RUTA_DESCRIPCION ?? "",
      handheld: limpio(asig?.HANDHELD),
      agente,
      agenteNombre: nombreAgente.get(agente) ?? "",
      cliente: limpio(v.CLIENTE),
      clienteNombre: v.CLIENTE_NOMBRE ?? "",
      tipo: TIPOS_VISITA[tipo] ?? tipo,
      proceso,
      fecha: v.INICIO,
      horaInicio: v.INICIO,
      horaFin: v.FIN,
      duracion: v.DURACION_MIN,
      documentos: docs.map((d) => limpio(d.NUM_PED)),
      estado,
    };
  }
}
