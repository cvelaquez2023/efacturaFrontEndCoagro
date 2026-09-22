export interface ICreateGrupoArticuloModel {
  grupoArticulo: string;
  descripcion: string;
}
export interface IResponseGrupoArticulo {
  GRUPO_ARTICULO: string;
  DESCRIPCION: string;
}

export interface IResponseArticuloRt {
  COMPANIA: string | null;
  ARTICULO: string;
  DESCRIPCION: string;
  FACTOR_PRECIO: number;
  ORDEN_ARTICULO: string;
  BODEGA: string;
  LOCALIZACION: string;
}

export interface IResponseGrupoArtAsoc {
  GRUPO_ARTICULO: string;
  ARTICULO: string;
  COMPANIA: string | null;
}

export interface ICreateGrupoArtAsocModel {
  grupoArticulo: string;
  articulo: string;
}
