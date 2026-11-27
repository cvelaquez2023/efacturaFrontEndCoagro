export interface IResponseConsecutivo {
  CONSECUTIVO: string;
  ULTIMO_VALOR: string;
}
export interface IResponseDte14MH {
  selloRecibido: string;
}
/** Dirección en el formato del esquema MH v2 (CAT-012 / CAT-013 / CAT-008). */
export interface IDireccionMh {
  departamento: string | null;
  municipio: string | null;
  distrito: string | null;
  complemento: string | null;
}

export interface IResponseDTE14 {
  /** null si no hay correo válido (v2: null o 6..100 caracteres). */
  correo: string | null;
  tipoDocumento: string;
  numDocumento: string;
  nombre: string;
  /** null si no hay teléfono válido (v2: null o 8..30 caracteres). */
  telefono: string | null;
  /** Departamento y municipio como hasta ahora (v1). distrito lo usa el backend solo en v2. */
  direccion: {
    departamento: string;
    municipio: string;
    /** Opcional: los reenvíos (hacienda = "S") no la mandan; el backend lee lo guardado. */
    distrito?: string | null;
    complemento: string;
  };
  /** Dirección ya en formato MH v2 (de dte_proveedor: DEPTO_MH, MUNI_MH, DISTRITO_MH). */
  direccionMh?: IDireccionMh | null;
  aplicacion: {
    descripcion: string;
    monto: number;
    renta: number;
    total: number;
    fecha: string;
    dte: string;
  };
  hacienda: string;
  origen: string;
}
