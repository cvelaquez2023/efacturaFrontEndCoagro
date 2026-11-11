/**
 * Modelos de Metas de Venta (CINCOH.MetaVentaProducto) y sus catálogos
 * (CINCOH.Lider, CINCOH.ProveedorMeta, CINCOH.LineaNegocio).
 * Backend: /fr/lider, /fr/proveedorMeta, /fr/lineaNegocio, /fr/metaVentaProducto.
 */

/** Fila de Lider / ProveedorMeta / LineaNegocio (lineaNegocio usa `activa`, los otros `activo`). */
export interface ICatalogoMeta {
  id: number;
  codigo: string;
  nombre: string;
  email?: string | null;
  activo?: boolean;
  activa?: boolean;
}

export interface ICatalogoConfig {
  /** Recurso del backend: /fr/<recurso>. */
  recurso: "lider" | "proveedorMeta" | "lineaNegocio";
  titulo: string;
  singular: string;
  /** Artículo para los mensajes: "el" / "la". */
  articulo: "el" | "la";
  codigoMax: number;
  campoActivo: "activo" | "activa";
  conEmail: boolean;
}

export const CATALOGO_LIDERES: ICatalogoConfig = {
  recurso: "lider",
  titulo: "Líderes",
  singular: "líder",
  articulo: "el",
  codigoMax: 4,
  campoActivo: "activo",
  conEmail: true,
};

export const CATALOGO_PROVEEDORES: ICatalogoConfig = {
  recurso: "proveedorMeta",
  titulo: "Proveedores",
  singular: "proveedor",
  articulo: "el",
  codigoMax: 8,
  campoActivo: "activo",
  conEmail: false,
};

export const CATALOGO_LINEAS_NEGOCIO: ICatalogoConfig = {
  recurso: "lineaNegocio",
  titulo: "Líneas de Negocio",
  singular: "línea de negocio",
  articulo: "la",
  codigoMax: 4,
  campoActivo: "activa",
  conEmail: false,
};

export const estaActivo = (item: ICatalogoMeta, cfg: ICatalogoConfig): boolean =>
  (cfg.campoActivo === "activa" ? item.activa : item.activo) !== false;

/** Fila de GET /fr/metaVentaProducto (raw + nest: los includes vienen anidados). */
export interface IMetaVenta {
  IdMeta: number;
  Anio: number;
  Mes: number;
  IdLineaNegocio: number;
  IdLider: number;
  Vendedor: string;
  Articulo: string;
  IdProveedor: number;
  Meta_Unidades: number | string;
  Venta_Unidades: number | string | null;
  Venta_Valor: number | string | null;
  lineaNegocio?: { codigo: string | null; nombre: string | null } | null;
  lider?: { codigo: string | null; nombre: string | null } | null;
  proveedor?: { codigo: string | null; nombre: string | null } | null;
  vendedor?: { NOMBRE: string | null } | null;
  articulo?: { DESCRIPCION: string | null } | null;
}

/** Body de POST/PUT /fr/metaVentaProducto (camelCase). */
export interface IMetaVentaBody {
  anio: number;
  mes: number;
  idLineaNegocio: number;
  idLider: number;
  vendedor: string;
  articulo: string;
  idProveedor: number;
  metaUnidades: number;
  ventaUnidades?: number | null;
  ventaValor?: number | null;
}

export interface IFiltroMetas {
  anio?: number | null;
  mes?: number | null;
  idLineaNegocio?: number | null;
  idLider?: number | null;
  idProveedor?: number | null;
  vendedor?: string | null;
  articulo?: string | null;
}

export interface IVendedor {
  codigo: string;
  nombre: string;
}

export const MESES: string[] = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const nombreMes = (mes: number | null | undefined): string =>
  mes && mes >= 1 && mes <= 12 ? MESES[mes - 1] : "";

/** Decimal de SQL Server (puede llegar como texto) a número; null si viene vacío. */
export const aNumero = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Primer mensaje del `errors` del backend, o el texto por defecto. */
export const primerError = (errores: string[] | undefined | null, porDefecto: string): string =>
  errores && errores.length ? errores.join(" · ") : porDefecto;

/** Catálogos que usan la lista de metas, su diálogo y la carga de presupuesto. */
export interface ICatalogosMetas {
  lineas: ICatalogoMeta[];
  lideres: ICatalogoMeta[];
  proveedores: ICatalogoMeta[];
  vendedores: IVendedor[];
}
