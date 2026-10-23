/** Fila de GET /fr/reporteVisita: una visita (erpadmin.VISITA) con nombres y su punto GPS
 *  (erpadmin.VISITA_UBICACION, misma llave CLIENTE+RUTA+INICIO). */
export interface IReporteVisita {
  RUTA: string;
  RUTA_DESCRIPCION: string | null;
  CLIENTE: string;
  CLIENTE_NOMBRE: string | null;
  INICIO: string;
  FIN: string | null;
  DURACION_MIN: number | null;
  FECHA_PLAN: string | null;
  RAZON: string | null;
  RAZON_DESCRIPCION: string | null;
  TIPO: string | null;
  NOTAS: string | null;
  DOC_PRO: string | null;
  LATITUD: number | null;
  LONGITUD: number | null;
  ALTITUD: number | null;
  TIEMPO_GPS: string | null;
  TIEMPO_PDA: string | null;
  PDOP: number | null;
  ERROR: number | null;
}

/** Fila de GET /fr/reporteVisita/resumen: totales por ruta y día. */
export interface IResumenVisita {
  RUTA: string;
  RUTA_DESCRIPCION: string | null;
  FECHA: string;
  TOTAL_VISITAS: number;
  CLIENTES_VISITADOS: number;
  VISITAS_CON_GPS: number;
  DURACION_PROMEDIO_MIN: number | null;
  DURACION_TOTAL_MIN: number | null;
  PRIMERA_VISITA: string | null;
  ULTIMA_VISITA: string | null;
}

/** Query string común de /fr/reporteVisita y /resumen (fechas YYYY-MM-DD, ambas inclusive). */
export interface IFiltroReporteVisita {
  ruta?: string;
  cliente?: string;
  razon?: string;
  tipo?: string;
  desde?: string;
  hasta?: string;
}

/** Agente de ruteo (AGENTE_ASOC_RT.CODIGO, lo que guarda RUTA_ASIGNADA_RT.AGENTE) con el nombre
 *  del vendedor del ERP al que está asociado. */
export interface IAgenteReporte {
  codigo: string;
  vendedor: string;
  nombre: string;
}

/** Cabecera de ruta asignada (RUTA_ASIGNADA_RT) tal como la usan los reportes. */
export interface IRutaAsignadaReporte {
  RUTA: string;
  AGENTE: string;
  HANDHELD: string;
  ACTIVA: string;
}

/** Fila de la Bitácora de Sincronización (cargas/descargas entre handheld, tablas intermedias
 *  y ERP). Todavía no existe tabla/endpoint en el backend: ver BitacoraSincronizacionApiService. */
export type EstadoSincronizacion = "Exitosa" | "Con errores" | "En proceso";

export interface IBitacoraSincronizacion {
  ruta: string;
  handheld: string;
  agente: string;
  tipo: "Carga" | "Descarga";
  proceso: string;
  fecha: string;
  horaInicio: string | null;
  horaFin: string | null;
  registros: number | null;
  estado: EstadoSincronizacion;
  mensaje: string | null;
}

/** Fila de GET /fr/pedido: encabezado de pedido de la handheld (erpadmin.alFAC_ENC_PED) con
 *  nombres. COD_ZON = ruta, COD_CLT = cliente; HOR_INI/HOR_FIN caen dentro de la visita en que
 *  se tomó el pedido. */
export interface IPedidoReporte {
  COD_CIA: string;
  CLIENTE_NOMBRE: string | null;
  RUTA_DESCRIPCION: string | null;
  COD_ZON: string;
  COD_CLT: string;
  NUM_PED: string;
  FEC_PED: string;
  HOR_INI: string | null;
  HOR_FIN: string | null;
  /** Monto con IVA (total del pedido). */
  MON_CIV: number | null;
  /** Monto sin IVA. */
  MON_SIV: number | null;
  MON_DSC: number | null;
  ESTADO: string | null;
}
