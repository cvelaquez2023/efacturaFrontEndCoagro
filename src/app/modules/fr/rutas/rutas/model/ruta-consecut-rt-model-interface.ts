/**
 * Consecutivos de una Ruta, tabla real ERPADMIN.RUTA_CONSECUT_RT (endpoint /fr/rutaConsecutRt).
 * Relación 1:1 con RUTA_RT (PK = RUTA); COMPANIA siempre NULL porque el sistema no maneja
 * compañías. La tabla tiene ~54 columnas (NCF, SUBTIPO_, DTE_...); aquí solo se tipan las que
 * captura el Mantenimiento de Ruta. El PUT solo toca las columnas que se le mandan, así que las
 * demás se conservan tal cual estén en BD.
 */
export interface IResponseRutaConsecutRt {
  RUTA: string;
  COMPANIA: string | null;
  PEDIDO: string;
  RECIBO: string;
  DEVOLUCION: string;
  FACTURA: string;
  INVENTARIO: string;
  PEDIDO_DESCUENTO: string;
  NOTACREDITO: string | null;
  NCF_CONSUMIDOR_F: string | null;
}

export interface IRutaConsecutRtModel {
  pedido: string;
  recibo: string;
  devolucion: string;
  factura: string;
  inventario: string;
  pedidoDescuento: string;
  notacredito: string | null;
  ncfConsumidorF: string | null;
}

export interface ICreateRutaConsecutRtModel extends IRutaConsecutRtModel {
  ruta: string;
}
