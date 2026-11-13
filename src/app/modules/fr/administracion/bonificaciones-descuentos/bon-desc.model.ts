/**
 * Bonificaciones y Descuentos (FR → Administración): CRUD de las tablas nativas de erpadmin que baja la
 * handheld: DESCUENTO_CLIART, DESCUENTO_NIVEL, BONIFICACION_CLIART y BONIFICACION_NIVEL.
 * Backend: controllers/fr/descuentoBase.js (+ un controller por tabla).
 *
 * Todas tienen la misma forma: una ENTIDAD (cliente + artículo, o nivel de precio + moneda + artículo),
 * un RANGO (cantidades CANT_MIN..CANT_MAX y fechas FECHA_INICIO..FECHA_FIN) y los VALORES.
 * La llave es entidad + rango: PUT/DELETE van a /:entidad.../:cantMin/:cantMax/:fechaInicio/:fechaFin.
 * La entidad no se edita (se borra y se crea de nuevo). No se permiten rangos traslapados.
 */

export type TipoCampo = "cliente" | "articulo" | "nivel" | "moneda" | "tipoDescuento" | "numero" | "porcentaje";

export interface ICampoBD {
  /** Nombre camelCase en query/body/URL (cliente, articulo, nivelPrecio, porcDesc…). */
  clave: string;
  /** Columna que devuelve el backend (CLIENTE, ARTICULO, NIVEL_PRECIO…). */
  columna: string;
  etiqueta: string;
  tipo: TipoCampo;
  obligatorio: boolean;
  ayuda?: string;
}

export interface IConfigBD {
  /** Ruta del backend: /fr/<recurso>. */
  recurso: string;
  titulo: string;
  singular: string;
  icono: string;
  descripcion: string;
  entidad: ICampoBD[];
  valores: ICampoBD[];
  /** Bonificación (regala producto) o descuento. */
  esBonificacion: boolean;
}

/** Fila tal como la devuelve GET /fr/<recurso> (columnas + nombres agregados por el backend). */
export interface IFilaBD {
  COMPANIA: string;
  CLIENTE?: string;
  NOMBRE_CLIENTE?: string | null;
  NIVEL_PRECIO?: string;
  MONEDA?: string;
  ARTICULO: string;
  DESCRIPCION_ARTICULO?: string | null;
  CANT_MIN: number;
  CANT_MAX: number;
  /** YYYY-MM-DD */
  FECHA_INICIO: string;
  FECHA_FIN: string;
  TIPO?: string;
  MONTO?: number | string;
  PORC_DESC?: number | string;
  ARTICULO_BONIF?: string;
  DESCRIPCION_ARTICULO_BONIF?: string | null;
  UNIDADES_BONIF?: number | string;
  FACTOR_BONIF?: number | string | null;
  [columna: string]: unknown;
}

/** Niveles de precio de erpadmin.NIVEL_LISTA (leídos el 2026-11-12; todos en dólares). */
export const NIVELES_PRECIO: { nivel: string; moneda: string }[] = [
  { nivel: "DETALLISTA", moneda: "D" },
  { nivel: "DISTRIBUIDOR", moneda: "D" },
  { nivel: "DOL", moneda: "D" },
  { nivel: "EXPORTACION", moneda: "D" },
  { nivel: "GERENCIA", moneda: "D" },
];

export const MONEDAS = [
  { codigo: "D", nombre: "Dólar" },
  { codigo: "L", nombre: "Local" },
];

const cliente: ICampoBD = { clave: "cliente", columna: "CLIENTE", etiqueta: "Cliente", tipo: "cliente", obligatorio: true };
const articulo: ICampoBD = { clave: "articulo", columna: "ARTICULO", etiqueta: "Artículo", tipo: "articulo", obligatorio: true };
const nivel: ICampoBD = { clave: "nivelPrecio", columna: "NIVEL_PRECIO", etiqueta: "Nivel de precio", tipo: "nivel", obligatorio: true };
const moneda: ICampoBD = { clave: "moneda", columna: "MONEDA", etiqueta: "Moneda", tipo: "moneda", obligatorio: true };
const bonificacion: ICampoBD[] = [
  { clave: "articuloBonif", columna: "ARTICULO_BONIF", etiqueta: "Artículo que se regala", tipo: "articulo", obligatorio: true, ayuda: "Puede ser el mismo artículo" },
  { clave: "unidadesBonif", columna: "UNIDADES_BONIF", etiqueta: "Unidades que se regalan", tipo: "numero", obligatorio: true },
  { clave: "factorBonif", columna: "FACTOR_BONIF", etiqueta: "Factor (opcional)", tipo: "numero", obligatorio: false, ayuda: "Cada cuántas unidades compradas se regala (si aplica)" },
];

export const CONFIGS_BD: IConfigBD[] = [
  {
    recurso: "descuentoCliart",
    titulo: "Descuentos por cliente",
    singular: "descuento por cliente",
    icono: "person",
    descripcion: "Descuento de un artículo para un cliente: porcentaje o monto fijo, por rango de cantidades y fechas.",
    entidad: [cliente, articulo],
    valores: [
      { clave: "tipo", columna: "TIPO", etiqueta: "Tipo de descuento", tipo: "tipoDescuento", obligatorio: true },
      { clave: "monto", columna: "MONTO", etiqueta: "Descuento", tipo: "numero", obligatorio: true, ayuda: "Porcentaje (máx. 100) o monto fijo en $" },
    ],
    esBonificacion: false,
  },
  {
    recurso: "descuentoNivel",
    titulo: "Descuentos por nivel de precio",
    singular: "descuento por nivel de precio",
    icono: "layers",
    descripcion: "Porcentaje de descuento de un artículo para todos los clientes de un nivel de precio.",
    entidad: [nivel, moneda, articulo],
    valores: [{ clave: "porcDesc", columna: "PORC_DESC", etiqueta: "% de descuento", tipo: "porcentaje", obligatorio: true }],
    esBonificacion: false,
  },
  {
    recurso: "bonificacionCliart",
    titulo: "Bonificaciones por cliente",
    singular: "bonificación por cliente",
    icono: "redeem",
    descripcion: "Producto que se regala a un cliente al comprar un artículo, por rango de cantidades y fechas.",
    entidad: [cliente, articulo],
    valores: bonificacion,
    esBonificacion: true,
  },
  {
    recurso: "bonificacionNivel",
    titulo: "Bonificaciones por nivel de precio",
    singular: "bonificación por nivel de precio",
    icono: "card_giftcard",
    descripcion: "Producto que se regala a todos los clientes de un nivel de precio al comprar un artículo.",
    entidad: [nivel, moneda, articulo],
    valores: bonificacion,
    esBonificacion: true,
  },
];

/** Campos del rango (parte de la llave). */
export const RANGO_BD = ["cantMin", "cantMax", "fechaInicio", "fechaFin"] as const;

/** Ruta de la llave para PUT/DELETE: /<entidad...>/<cantMin>/<cantMax>/<fechaInicio>/<fechaFin>. */
export const llaveDe = (cfg: IConfigBD, fila: IFilaBD): string =>
  [
    ...cfg.entidad.map((c) => String(fila[c.columna] ?? "").trim()),
    fila.CANT_MIN,
    fila.CANT_MAX,
    String(fila.FECHA_INICIO).slice(0, 10),
    String(fila.FECHA_FIN).slice(0, 10),
  ]
    .map((v) => encodeURIComponent(String(v)))
    .join("/");

export type EstadoVigencia = "VIGENTE" | "PROGRAMADA" | "VENCIDA";

export const vigenciaDe = (fila: IFilaBD, hoy: string): EstadoVigencia =>
  String(fila.FECHA_INICIO).slice(0, 10) > hoy ? "PROGRAMADA" : String(fila.FECHA_FIN).slice(0, 10) < hoy ? "VENCIDA" : "VIGENTE";
