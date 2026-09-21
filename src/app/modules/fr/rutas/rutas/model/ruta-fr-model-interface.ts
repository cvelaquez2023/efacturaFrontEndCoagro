export interface ICreateRutaModel {
  ruta: string;
  descripcion: string;
  activa: string;
  periodicidad: string;
  grupoTelefono?: string;
}
export interface IResponseRuta {
  RUTA: string;
  DESCRIPCION: string;
  ACTIVA: string;
  PERIODICIDAD: string;
  GRUPO_TELEFONO: string;
}
