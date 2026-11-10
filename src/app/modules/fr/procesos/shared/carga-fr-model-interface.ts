/** Fila de resumen que devuelve ERPADMIN.CargaAlERP (primer SELECT). */
export interface IResumenCargaErp {
  PEDIDOS_CARGADOS: number;
  PEDIDOS_CON_ERROR: number;
}

/** Detalle por pedido (ERPADMIN.LOG_CARGA_ERP de esta ejecución, segundo SELECT). */
export interface IDetalleCargaErp {
  NUM_PED: string;
  RESULTADO: "OK" | "ERROR" | string;
  MENSAJE: string;
  FECHA: string;
}

export interface IResultadoCargaErp {
  cargados: number;
  conError: number;
  detalle: IDetalleCargaErp[];
}

/** Una ejecución de carga hecha desde esta sesión del navegador (pestaña Bitácoras). */
export interface IEjecucionCarga {
  tipo: "ERP" | "HANDHELD";
  inicio: Date;
  duracionSeg: number;
  exito: boolean;
  compania?: string;
  mensaje: string;
}
