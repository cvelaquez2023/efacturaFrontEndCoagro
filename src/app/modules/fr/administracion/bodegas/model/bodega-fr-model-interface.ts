export interface ICreateBodegaFrModel {
  bodega: string;
  nombre?: string;
  bodegaErp?: string;
}
export interface IResponseBodegaFr {
  BODEGA: string;
  NOMBRE: string;
  BODEGA_ERP: string | null;
}

/** bodegaAsocRt: asocia una BODEGA (ya existente en bodegaRt) a un CODIGO propio de ruteo. No tiene NOMBRE. */
export interface ICreateBodegaAsocRtModel {
  bodega: string;
  codigo: string;
  codigoBodegaRetablecer?: "S" | "N";
  paqueteInventario?: "S" | "N";
  consecutivoCi?: string;
  localizacion?: string;
}
export interface IResponseBodegaAsocRt {
  BODEGA: string;
  CODIGO: string;
  COMPANIA: string | null;
  CODIGO_BODEGA_RETABLECER: "S" | "N";
  PAQUETE_INVENTARIO: string | null;
  CONSECUTIVO_CI: string | null;
  LOCALIZACION: string | null;
}
/** Fila combinada para la grilla de Bodegas: datos de bodegaAsocRt enriquecidos con el NOMBRE de bodegaRt. */
export interface IResponseBodegaConAsoc extends IResponseBodegaFr {
  CODIGO: string;
  CODIGO_BODEGA_RETABLECER: "S" | "N";
  PAQUETE_INVENTARIO: string | null;
  CONSECUTIVO_CI: string | null;
  LOCALIZACION: string | null;
}
