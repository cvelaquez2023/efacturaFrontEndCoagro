export interface IResponseClienteErp {
  CLIENTE: string;
  NOMBRE: string;
  ALIAS?: string;
  ACTIVO: string;
  RUTA?: string;
  VENDEDOR?: string;
}

export interface IPaginacionClienteErp {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IResponsePaginadaClienteErp<T> {
  success: boolean;
  errors: string[];
  result: T;
  pagination: IPaginacionClienteErp;
}
