export interface ICreateArticuloFrModel {
  articulo: string;
  descripcion: string;
  factorPrecio?: number;
  ordenArticulo?: string;
  bodega?: string;
  localizacion?: string;
}
export interface IResponseArticuloFr {
  COMPANIA: string | null;
  ARTICULO: string;
  DESCRIPCION: string;
  FACTOR_PRECIO: number;
  ORDEN_ARTICULO: string;
  BODEGA: string;
  LOCALIZACION: string;
}
