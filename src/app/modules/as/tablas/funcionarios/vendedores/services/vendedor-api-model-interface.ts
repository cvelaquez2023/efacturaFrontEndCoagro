export interface IResponseVendedor {
  codVendedor: string;
  nombre: string;
  email: string;
  activo: boolean;
  id: number;
  isDelete: boolean;
}

export interface IRequestCreateVendedor {
  codVendedor: string;
  nombre: string;
  email: string;
  activo: boolean;
}
/** Fila de GET /proveedor?q= (búsqueda en el ERP). */
export interface IProveedorBusqueda {
  PROVEEDOR: string;
  NOMBRE: string;
  ALIAS: string | null;
  CONTRIBUYENTE: string | null;
  ACTIVO: string | null;
}

export interface IResponseProveedor {
  PROVEEDOR: string;
  CONTRIBUYENTE: string;
  NOMBRE: string;
  DIRECCION: string;
  DIVISION_GEOGRAFICA1: string;
  DIVISION_GEOGRAFICA2: string;
  TELEFONO1: string;
  E_MAIL: string;
  /** Desde la Fase 1 de DTE v2 (dte_proveedor). Opcionales por si el procedimiento aún no se actualizó. */
  DIVISION_GEOGRAFICA3?: string | null;
  DEPTO_MH?: string | null;
  MUNI_MH?: string | null;
  DISTRITO_MH?: string | null;
  DIRECCION_MH?: string | null;
  TELEFONO_MH?: string | null;
  CORREO_MH?: string | null;
  /** null si el proveedor está listo para DTE v2; si no, el motivo (ej. "SIN DISTRITO"). */
  PROBLEMA_MH?: string | null;
}
