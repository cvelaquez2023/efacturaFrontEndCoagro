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
  /** Incentivo por unidad (decimal). 0 si no se indicó. */
  Incentivo?: number | string | null;
  /** Mínimo de unidades. Igual a Meta_Unidades si no se indicó. */
  minimo?: number | string | null;
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
  incentivo?: number | null;
  minimo?: number | null;
}

// ---------------------------------------------------------------- Carga por Excel (backend)

/** result.resumen de POST /fr/metaVentaProducto/importar. */
export interface IResumenImportacion {
  filasLeidas: number;
  filasValidas: number;
  filasConError: number;
  vendedores: number;
  periodos: number;
  proveedoresNuevos: number;
  /** Solo en la vista previa (?validar=true). */
  metasExistentesAReemplazar?: number;
  /** Solo al guardar. */
  insertadas?: number;
  reemplazadas?: number;
}

/** Fila validada que devuelve la vista previa (con nombres para mostrar). */
export interface IMetaImportada {
  fila: number;
  Anio: number;
  Mes: number;
  Vendedor: string;
  Articulo: string;
  Meta_Unidades: number;
  Incentivo: number;
  minimo: number;
  proveedorNuevo: boolean;
  /** "001 - Veterinaria 1" */
  lineaNegocio: string;
  /** "001 - Douglas" */
  lider: string;
  /** "CALOX - CALOX" o "... (NUEVO)" */
  proveedor: string;
  vendedorNombre: string | null;
  articuloDescripcion: string | null;
}

export interface IPeriodoImportado {
  anio: number;
  mes: number;
  vendedor: string;
  filas: number;
}

export interface IProveedorNuevo {
  codigo: string;
  nombre: string;
  filas: number;
  id?: number;
}

export interface IResultadoImportacion {
  resumen?: IResumenImportacion;
  mensaje?: string;
  proveedoresNuevos?: IProveedorNuevo[];
  periodos?: IPeriodoImportado[];
  metas?: IMetaImportada[];
}

/**
 * Venta del ERP por vendedor, artículo y día (CINCOH.FACTURA + FACTURA_LINEA, sin anuladas;
 * devoluciones restan, por eso UNIDADES/VALOR pueden ser negativos). Solo días con movimiento.
 * GET /fr/metaVentaProducto/ventasDiarias → result.ventas.
 */
export interface IVentaDia {
  VENDEDOR: string;
  NOMBRE_VENDEDOR?: string | null;
  ARTICULO: string;
  DESCRIPCION_ARTICULO?: string | null;
  /** Día del mes (1..31). */
  DIA: number;
  /** Semana por días del backend: 1-7 = 1, 8-14 = 2, 15-21 = 3, 22-28 = 4, 29-31 = 5. */
  SEMANA: number;
  /** YYYY-MM-DD */
  FECHA: string;
  UNIDADES: number;
  VALOR: number;
  /** Costo (FACTURA_LINEA.COSTO_TOTAL, mismo signo que VALOR): ganancia = VALOR − COSTO. */
  COSTO?: number | null;
  /** Proveedor y línea: de las metas (ProveedorMeta/LineaNegocio) si el artículo tiene meta; si no, del
   *  ERP (ARTICULO.PROVEEDOR, ej. EXT-0017, y ARTICULO.CLASIFICACION_1). */
  PROVEEDOR?: string | null;
  NOMBRE_PROVEEDOR?: string | null;
  LINEA?: string | null;
  NOMBRE_LINEA?: string | null;
  PROVEEDOR_ERP?: string | null;
  /** De dónde salió la clasificación: 'META' o 'ERP'. */
  ORIGEN_CLASIFICACION?: string | null;
  /** @deprecated nombre anterior; el backend envía NOMBRE_LINEA. */
  LINEA_DESCRIPCION?: string | null;
}

/** Respuesta de POST /fr/metaVentaProducto/actualizarVentas. */
export interface IResultadoActualizarVentas {
  metasActualizadas: number;
  anio: number | null;
  mes: number | null;
  alcance: string;
  segundos: number;
}

/** GET /fr/metaVentaProducto/consulta: manual de la carga. */
export interface IConsultaMetas {
  plantilla: { columna: string; obligatoria: boolean; ejemplo: string | number; descripcion: string }[];
  reglas: string[];
  lineasNegocio: { id: number; codigo: string; nombre: string; activa: boolean | null }[];
  lideres: { id: number; codigo: string; nombre: string; activo: boolean | null }[];
  proveedores: { id: number; codigo: string; nombre: string; activo: boolean | null }[];
  vendedores: { codigo: string; nombre: string }[];
  periodosCargados: {
    Anio: number;
    Mes: number;
    Vendedor: string;
    vendedorNombre: string | null;
    articulos: number;
    metaUnidades: number;
    fechaCarga: string | null;
    usuarioCarga: string | null;
  }[];
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
/**
 * El backend escribe sin tildes ni eñe ("anio", "articulo", "linea", "lider"...). Se corrigen las
 * palabras conocidas antes de mostrar el mensaje al usuario.
 */
const CORRECCIONES: [RegExp, string][] = [
  [/\banios?\b/g, "año"],
  [/\bAnio\b/g, "Año"],
  [/\barticulos\b/g, "artículos"],
  [/\barticulo\b/g, "artículo"],
  [/\bArticulo\b/g, "Artículo"],
  [/\blineas\b/g, "líneas"],
  [/\blinea\b/g, "línea"],
  [/\bLinea\b/g, "Línea"],
  [/\blideres\b/g, "líderes"],
  [/\blider\b/g, "líder"],
  [/\bLider\b/g, "Líder"],
  [/\bnumerico\b/g, "numérico"],
  [/\bmaximo\b/g, "máximo"],
  [/\btamano\b/g, "tamaño"],
  [/\bcodigo\b/g, "código"],
  [/\besta inactiv/g, "está inactiv"],
  [/\besta en uso\b/g, "está en uso"],
];

export const conTildes = (texto: string): string =>
  CORRECCIONES.reduce((t, [patron, reemplazo]) => t.replace(patron, reemplazo), texto);

export const primerError = (errores: string[] | undefined | null, porDefecto: string): string =>
  conTildes(errores && errores.length ? errores.join(" · ") : porDefecto);

/** Catálogos que usan la lista de metas, su diálogo y la carga de presupuesto. */
export interface ICatalogosMetas {
  lineas: ICatalogoMeta[];
  lideres: ICatalogoMeta[];
  proveedores: ICatalogoMeta[];
  vendedores: IVendedor[];
}
