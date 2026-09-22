export interface ICreateClienteFrModel {
  cliente: string;
  nombre: string;
  latitud?: number;
  longitud?: number;
  altitud?: number;
  fechaActualizacionUbicacion?: string;
}
export interface IResponseClienteFr {
  CLIENTE: string;
  NOMBRE: string;
  LATITUD: number;
  LONGITUD: number;
  ALTITUD: number;
  FECHA_ACTUALIZACION_UBICACION: string;
}

/** clienteAsocRt: asocia un CLIENTE (ya existente en clienteRt) a un CODIGO propio de ruteo. No tiene NOMBRE. */
export interface ICreateClienteAsocRtModel {
  cliente: string;
  codigo: string;
  bodegaConsigna?: string;
  localizacionConsigna?: string;
}
export interface IResponseClienteAsocRt {
  CODIGO: string;
  CLIENTE: string;
  COMPANIA: string | null;
  BODEGA_CONSIGNA: string | null;
  LOCALIZACION_CONSIGNA: string | null;
}
/** Fila combinada para la grilla de Clientes: datos de clienteAsocRt enriquecidos con el NOMBRE de clienteRt. */
export interface IResponseClienteConAsoc extends IResponseClienteFr {
  CODIGO: string;
  BODEGA_CONSIGNA: string | null;
  LOCALIZACION_CONSIGNA: string | null;
}
