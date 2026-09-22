export interface IResponseVendedorErp {
  VENDEDOR: string;
  NOMBRE: string;
  EMPLEADO: string;
  COMISION: number;
  E_MAIL: string;
  Correo: string;
  telefono: string;
  ACTIVO: string;
}

export interface IPaginacionVendedorErp {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IResponsePaginadaVendedorErp<T> {
  success: boolean;
  errors: string[];
  result: T;
  pagination: IPaginacionVendedorErp;
}
