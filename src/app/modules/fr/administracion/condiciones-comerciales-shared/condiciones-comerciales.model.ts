/**
 * Modelo compartido de Condiciones Especiales por Cliente, Promociones de Temporada y Consulta de
 * Precios (FR → Administración). Contrato: docs/fr/backend-condiciones-promociones.md.
 * Respuestas del backend en MAYÚSCULAS (como las columnas), cuerpos POST/PUT en camelCase.
 */

/** 'A' artículo, 'L' línea (ARTICULO.CLASIFICACION3), 'T' texto contenido en la descripción. */
export type Alcance = "A" | "L" | "T";
export type EstadoRegla = "VIGENTE" | "PROGRAMADA" | "VENCIDA" | "INACTIVA";
/** 'D' descuento %, 'P' precio especial, 'B' bonificación. */
export type TipoPromocion = "D" | "P" | "B";
/** 'T' todos, 'R' rutas, 'K' tipos de cliente, 'C' clientes. */
export type DestinoPromocion = "T" | "R" | "K" | "C";
export type TipoDestino = "R" | "K" | "C";
export type SiNo = "S" | "N";

// ---------------------------------------------------------------- Condiciones por cliente

export interface ICondicionCliente {
  ID: number;
  CLIENTE: string;
  CLIENTE_NOMBRE: string;
  ALCANCE: Alcance;
  VALOR: string;
  VALOR_DESCRIPCION: string;
  DESCUENTO_MAX: number | null;
  PRECIO_ESPECIAL: number | null;
  CANTIDAD_MIN: number | null;
  FECHA_INICIO: string;
  FECHA_FIN: string | null;
  ACTIVA: SiNo;
  NOTAS: string | null;
  ESTADO: EstadoRegla;
  RUTAS: string;
  AGENTE: string | null;
  AGENTE_NOMBRE: string | null;
  EN_CARTERA: boolean;
  USUARIO_CREACION?: string | null;
  FECHA_CREACION?: string | null;
}

export interface ICondicionClienteBody {
  cliente: string;
  alcance: Alcance;
  valor: string;
  descuentoMax: number | null;
  precioEspecial: number | null;
  cantidadMin: number | null;
  fechaInicio: string;
  fechaFin: string | null;
  activa: SiNo;
  notas: string | null;
}

export interface IFiltroCondicion {
  cliente?: string;
  agente?: string;
  ruta?: string;
  estado?: EstadoRegla | "";
  q?: string;
  fecha?: string;
}

// ---------------------------------------------------------------- Promociones

export interface IPromocionProducto {
  ID?: number;
  ALCANCE: Alcance;
  VALOR: string;
  VALOR_DESCRIPCION: string;
  CANTIDAD_MIN: number | null;
  DESCUENTO: number | null;
  PRECIO_ESPECIAL: number | null;
}

export interface IPromocionDestino {
  TIPO: TipoDestino;
  VALOR: string;
  DESCRIPCION?: string;
}

export interface IPromocion {
  ID: number;
  TITULO: string;
  DESCRIPCION: string | null;
  TIPO: TipoPromocion;
  FECHA_INICIO: string;
  FECHA_FIN: string;
  DESTINO: DestinoPromocion;
  ARTICULO_BONIFICADO: string | null;
  ARTICULO_BONIFICADO_DESCRIPCION: string | null;
  CANTIDAD_BONIFICADA: number | null;
  ACTIVA: SiNo;
  ESTADO: EstadoRegla;
  productos: IPromocionProducto[];
  destinos: IPromocionDestino[];
}

export interface IPromocionProductoBody {
  alcance: Alcance;
  valor: string;
  cantidadMin: number | null;
  descuento: number | null;
  precioEspecial: number | null;
  /** Solo frontend (modo prueba): descripción para mostrar. El backend la ignora. */
  valorDescripcion?: string;
}

export interface IPromocionBody {
  titulo: string;
  descripcion: string | null;
  tipo: TipoPromocion;
  fechaInicio: string;
  fechaFin: string;
  destino: DestinoPromocion;
  articuloBonificado: string | null;
  cantidadBonificada: number | null;
  activa: SiNo;
  productos: IPromocionProductoBody[];
  destinos: { tipo: TipoDestino; valor: string; descripcion?: string }[];
  /** Solo frontend (modo prueba). */
  articuloBonificadoDescripcion?: string;
}

export interface IFiltroPromocion {
  estado?: EstadoRegla | "";
  tipo?: TipoPromocion | "";
  q?: string;
  fecha?: string;
}

// ---------------------------------------------------------------- Precio vigente

export interface IReglaCandidata {
  ORIGEN: "CONDICION" | "PROMOCION";
  ID: number;
  DESCRIPCION: string;
  DESCUENTO: number | null;
  PRECIO_ESPECIAL: number | null;
  PRECIO_RESULTANTE: number;
}

export interface IBonificacion {
  PROMOCION_ID: number;
  DESCRIPCION: string;
  CANTIDAD_MIN: number | null;
  ARTICULO: string | null;
  ARTICULO_DESCRIPCION: string | null;
  CANTIDAD: number | null;
}

export interface IPrecioVigente {
  CLIENTE: string;
  ARTICULO: string;
  ARTICULO_DESCRIPCION: string;
  LINEA: string | null;
  NIVEL_PRECIO: string | null;
  FECHA: string;
  PRECIO_BASE: number;
  IVA: number;
  PRECIO_FINAL: number;
  PRECIO_FINAL_IVA: number;
  REGLA_APLICADA: IReglaCandidata | null;
  REGLAS_CANDIDATAS: IReglaCandidata[];
  BONIFICACIONES: IBonificacion[];
  /** Advertencias del backend (cliente sin nivel de precio, artículo sin precio en el nivel…). */
  AVISOS?: string[];
}

export interface IFiltroPrecio {
  cliente: string;
  articulo: string;
  fecha: string;
  cantidad?: number | null;
}

// ---------------------------------------------------------------- Catálogos

export interface ICodigoNombre {
  codigo: string;
  nombre: string;
}

export interface IArticuloBusqueda extends ICodigoNombre {
  linea: string | null;
  precioBase: number | null;
}

/** Ruta(s) y agente del cliente según RUTA_CLIENTE + RUTA_ASIGNADA_RT. */
export interface ICarteraCliente {
  rutas: string[];
  agente: string | null;
  agenteNombre: string | null;
}

export const IVA = 0.13;

/** Mientras no exista GET /fr/lineaArticulo: copia de CINCOH.CLASIFICACION AGRUPACION 3
 *  (leída de COAGRO2 el 2026-11-11). */
export const LINEAS_MOCK: ICodigoNombre[] = [
  ["0002", "Productos Ourofino"], ["0003", "Productos Pfizer"], ["0004", "Productos Albion"],
  ["0005", "Productos Bayer Vet"], ["0006", "Productos Bayer Agricola"], ["0007", "Productos Reveex"],
  ["0008", "Productos Syngenta"], ["0009", "Productos CINCOH"], ["0010", "Productos Vet Calox"],
  ["0011", "Productos NUFARM"], ["0012", "Productos CTL"], ["0013", "Productos PROFICOL"],
  ["0014", "Productos Rainbow"], ["0015", "Productos SERVIAGRO"], ["0016", "Productos AGROENZYMAS"],
  ["0017", "Productos EL SURCO"], ["0018", "Productos BIOLOGICAL"], ["0019", "Producto CRS"],
  ["0020", "Producto MSD"], ["0021", "Productos EL AGRICULTOR"], ["0022", "Produtos C&F"],
  ["0023", "Produtos COMERSAL"], ["0024", "Productos Genética"], ["0025", "Productos DVA AGRO"],
  ["0026", "Producto AGROTERRA"], ["0027", "Producto del VALLE"], ["0028", "Productos ECASSA"],
  ["0029", "Productos ZELLAG"], ["0030", "Productos AGRO TRADING"],
  ["0031", "Producto Terminado ABORATO"], ["0032", "REPREVET"],
  ["ACIDIFICANTE", "ACIDIFICANTES"], ["ADHERE", "ADHERENTES"],
  ["AGRI  Y TERR", "AGRINICIN Y TERRA AGRICOLA"], ["ANT MASTI", "ANTIMASTITICOS"],
  ["ANTI-RYMADIL", "RYMADILES ANTIINFLAMATORIOS"], ["ATB. EMICINA", "ANTIBIOTICO EMICINA"],
  ["BOMBAS.", "BOMBAS CARPI"], ["BOVINOS", "BOVINOS"], ["DESIN.VANODI", "DESINFECTANTE VANODINE"],
  ["DESP. DECTO", "DESPARACITANTE DECTOMAX"], ["DIARREICO", "Anti Diarreico"],
  ["DIGESTOR", "ECODIGESTOR"], ["ENVASES.", "ENVASES"], ["FUNGI", "FUNGICIDAS"],
  ["HERBICIDA", "HERBICIDAS"], ["INSECTICIDAS", "INSECTICIDAS"], ["JERINGA", "JERINGAS Y EMPAQUES"],
  ["L PREMEZCLA", "PREMEZCLAS LINCO"], ["METALOSATES", "METALOSATES"], ["NUTRI", "NUTRISALES"],
  ["PETS", "PETS"], ["PORCINOS", "PORCINOS"], ["V.HORMO", "VETERINARIOS HORMONALES"],
  ["VET.OTROS", "VETERINARIOS OTROS"], ["VIÑETAS. V", "VIÑETAS VARIOS"],
].map(([codigo, nombre]) => ({ codigo, nombre }));

/** erpadmin.alFAC_TIP_CLT (18 filas, CINCOH). Ya se envía a la app en /fr/sync/clientes, pero no
 *  hay un GET admin para la web todavía. */
export const TIPOS_CLIENTE_MOCK: ICodigoNombre[] = [
  ["ND", "NO DEFINIDA"], ["LOC", "Arturo Romero"], ["EXT", "Exterior"], ["DET", "Detallista"],
  ["MAY", "Mayorista"], ["01", "AGROSERVICIO AGRICOLA"], ["02", "CAJAS DE CREDITO"],
  ["03", "SECTOR REFORMADO"], ["04", "PRIVADOS"], ["05", "VETERINARIO"],
  ["06", "GRANDES CONTRIBUYENTES"], ["07", "FERRETERIA"], ["08", "VIVEROS"],
  ["09", "CODISTRIBUIDOR"], ["10", "INSTITUCIONALES"], ["11", "HCD"], ["12", "HORECA"],
  ["13", "ESUNOFI"],
].map(([codigo, nombre]) => ({ codigo, nombre }));

/** Precio base de prueba ($ sin IVA) mientras no exista /fr/precioVigente: en el ERP
 *  PRECIO_BASE_DOLAR está en 0 y el precio real vive en ARTICULO_PRECIO por nivel. */
export const PRECIOS_BASE_MOCK: Record<string, number> = {
  "16001": 6.4,
  "16035": 8.85,
  "16003": 5.9,
  "15064": 38.5,
  "15057": 33.25,
  "16117": 24.0,
  "16117-1": 3.1,
  "15415": 1.75,
  "22009": 21.0,
  "22010": 23.0,
  "22011": 26.5,
};

export const ALCANCES: { codigo: Alcance; nombre: string }[] = [
  { codigo: "A", nombre: "Artículo" },
  { codigo: "L", nombre: "Línea" },
  { codigo: "T", nombre: "Texto en el nombre" },
];

export const TIPOS_PROMOCION: { codigo: TipoPromocion; nombre: string }[] = [
  { codigo: "D", nombre: "Descuento %" },
  { codigo: "P", nombre: "Precio especial" },
  { codigo: "B", nombre: "Bonificación (compre y lleve)" },
];

export const DESTINOS: { codigo: DestinoPromocion; nombre: string }[] = [
  { codigo: "T", nombre: "Todos los clientes" },
  { codigo: "R", nombre: "Rutas" },
  { codigo: "K", nombre: "Tipos de cliente" },
  { codigo: "C", nombre: "Clientes específicos" },
];

export const ESTADOS: { codigo: EstadoRegla | ""; nombre: string }[] = [
  { codigo: "VIGENTE", nombre: "Vigentes" },
  { codigo: "PROGRAMADA", nombre: "Programadas" },
  { codigo: "VENCIDA", nombre: "Vencidas" },
  { codigo: "INACTIVA", nombre: "Inactivas" },
  { codigo: "", nombre: "Todas" },
];

export const NOMBRE_ESTADO: Record<EstadoRegla, string> = {
  VIGENTE: "Vigente",
  PROGRAMADA: "Programada",
  VENCIDA: "Vencida",
  INACTIVA: "Inactiva",
};

// ---------------------------------------------------------------- Utilidades

/** Estado calculado (spec §4). Fechas YYYY-MM-DD, inclusivas; se comparan como texto. */
export const estadoRegla = (
  activa: SiNo,
  inicio: string,
  fin: string | null,
  fecha: string
): EstadoRegla => {
  if (activa === "N") return "INACTIVA";
  if (fecha < inicio.slice(0, 10)) return "PROGRAMADA";
  if (fin && fecha > fin.slice(0, 10)) return "VENCIDA";
  return "VIGENTE";
};

/** "2026-12-31" → "31/12/2026". */
export const fmtFechaCorta = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

export const fmtDinero = (valor: number | null | undefined): string =>
  valor == null
    ? ""
    : "$" +
      valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const redondear = (valor: number, decimales = 4): number =>
  Math.round(valor * 10 ** decimales) / 10 ** decimales;

/** Descripción corta del alcance: "Toda la línea Productos Vet Calox", "Productos que dicen
 *  “CREDELIO”" o "CIPER-CLOR X 356 ML (16003)". */
export const describirAlcance = (
  alcance: Alcance,
  valor: string,
  descripcion: string | null | undefined
): string => {
  if (alcance === "L") return `Toda la línea ${descripcion || valor}`;
  if (alcance === "T") return `Productos que dicen “${valor}”`;
  return descripcion ? `${descripcion} (${valor})` : valor;
};

export const describirCondicion = (c: ICondicionCliente): string => {
  const partes = [describirAlcance(c.ALCANCE, c.VALOR, c.VALOR_DESCRIPCION) + ":"];
  partes.push(
    c.DESCUENTO_MAX != null
      ? `hasta ${c.DESCUENTO_MAX} %`
      : `precio especial ${fmtDinero(c.PRECIO_ESPECIAL)} sin IVA`
  );
  let texto = partes.join(" ");
  if (c.CANTIDAD_MIN) texto += ` · a partir de ${c.CANTIDAD_MIN} u.`;
  if (c.ESTADO === "PROGRAMADA") texto += ` · inicia ${fmtFechaCorta(c.FECHA_INICIO)}`;
  if (c.FECHA_FIN) texto += ` · vigente hasta ${fmtFechaCorta(c.FECHA_FIN)}`;
  return texto;
};

/** ¿La regla (alcance + valor) aplica a este artículo? */
export const coincideAlcance = (
  alcance: Alcance,
  valor: string,
  articulo: { codigo: string; descripcion: string; linea: string | null }
): boolean => {
  const v = valor.trim().toUpperCase();
  if (alcance === "A") return articulo.codigo.trim().toUpperCase() === v;
  if (alcance === "L") return (articulo.linea ?? "").trim().toUpperCase() === v;
  return articulo.descripcion.toUpperCase().includes(v);
};

/** Validaciones de spec §5.1 (las mismas que hará el backend). */
export const validarCondicion = (
  body: ICondicionClienteBody,
  existentes: ICondicionCliente[],
  idEditando: number | null
): string[] => {
  const errores: string[] = [];
  if (!body.cliente) errores.push("Seleccione el cliente");
  if (!body.valor) errores.push("Indique el producto, la línea o el texto");
  if (body.alcance === "T" && body.valor.trim().length < 3)
    errores.push("El texto debe tener al menos 3 caracteres");
  const tieneDesc = body.descuentoMax != null;
  const tienePrecio = body.precioEspecial != null;
  if (tieneDesc === tienePrecio)
    errores.push("Indique el descuento máximo o el precio especial (solo uno)");
  if (tieneDesc && !(body.descuentoMax! > 0 && body.descuentoMax! <= 100))
    errores.push("El descuento debe ser mayor a 0 y hasta 100 %");
  if (tienePrecio && !(body.precioEspecial! > 0))
    errores.push("El precio especial debe ser mayor a cero");
  if (body.cantidadMin != null && !(Number.isInteger(body.cantidadMin) && body.cantidadMin > 0))
    errores.push("La cantidad mínima debe ser un entero mayor a cero");
  if (!body.fechaInicio) errores.push("La fecha de inicio es obligatoria");
  if (body.fechaFin && body.fechaFin < body.fechaInicio)
    errores.push("La fecha fin no puede ser menor que la fecha de inicio");
  if (!errores.length && body.activa === "S") {
    const fin = body.fechaFin || "9999-12-31";
    const traslape = existentes.some(
      (c) =>
        c.ID !== idEditando &&
        c.ACTIVA === "S" &&
        c.CLIENTE === body.cliente &&
        c.ALCANCE === body.alcance &&
        c.VALOR.toUpperCase() === body.valor.toUpperCase() &&
        c.FECHA_INICIO <= fin &&
        (c.FECHA_FIN || "9999-12-31") >= body.fechaInicio
    );
    if (traslape)
      errores.push("Ya existe una condición para ese cliente y producto en esas fechas");
  }
  return errores;
};

/** Validaciones de spec §5.2. */
export const validarPromocion = (body: IPromocionBody): string[] => {
  const errores: string[] = [];
  if (!body.titulo?.trim()) errores.push("El título es obligatorio");
  if ((body.titulo ?? "").length > 120) errores.push("El título admite hasta 120 caracteres");
  if (!body.fechaInicio || !body.fechaFin) errores.push("Las fechas de inicio y fin son obligatorias");
  else if (body.fechaFin < body.fechaInicio)
    errores.push("La fecha fin no puede ser menor que la fecha de inicio");
  if (!body.productos.length) errores.push("Agregue al menos un producto");
  body.productos.forEach((p, i) => {
    const n = `Producto ${i + 1}`;
    if (!p.valor?.trim()) errores.push(`${n}: indique el producto, la línea o el texto`);
    if (p.alcance === "T" && (p.valor ?? "").trim().length < 3)
      errores.push(`${n}: el texto debe tener al menos 3 caracteres`);
    if (body.tipo === "D" && !(p.descuento != null && p.descuento > 0 && p.descuento <= 100))
      errores.push(`${n}: el descuento debe ser mayor a 0 y hasta 100 %`);
    if (body.tipo === "P" && !(p.precioEspecial != null && p.precioEspecial > 0))
      errores.push(`${n}: el precio especial debe ser mayor a cero`);
    if (body.tipo === "B" && !(p.cantidadMin != null && p.cantidadMin > 0))
      errores.push(`${n}: indique cuántas unidades hay que comprar`);
  });
  if (body.tipo === "B") {
    if (!body.articuloBonificado) errores.push("Seleccione el artículo bonificado");
    if (!(body.cantidadBonificada != null && body.cantidadBonificada > 0))
      errores.push("La cantidad bonificada debe ser mayor a cero");
  }
  if (body.destino !== "T" && !body.destinos.length)
    errores.push("Seleccione al menos un destino (ruta, tipo de cliente o cliente)");
  return errores;
};

/**
 * Algoritmo de precio vigente (spec §5.4), igual al que hará el backend en utils/precioFr.js:
 * candidatas = condiciones del cliente + promociones dirigidas a él, activas y vigentes en `fecha`,
 * que coincidan con el artículo y cuya cantidad mínima se cumpla. Gana el precio resultante más bajo;
 * no se suman descuentos. Las bonificaciones no cambian el precio.
 */
export const calcularPrecioVigente = (entrada: {
  cliente: { codigo: string; rutas: string[]; tipo: string | null };
  articulo: { codigo: string; descripcion: string; linea: string | null };
  precioBase: number;
  fecha: string;
  cantidad: number | null;
  condiciones: ICondicionCliente[];
  promociones: IPromocion[];
  nivelPrecio?: string | null;
}): IPrecioVigente => {
  const { cliente, articulo, precioBase, fecha, cantidad } = entrada;
  const cumpleCantidad = (min: number | null) => min == null || cantidad == null || cantidad >= min;
  const resultante = (desc: number | null, precio: number | null) =>
    redondear(precio != null ? precio : precioBase * (1 - (desc ?? 0) / 100));

  const candidatas: IReglaCandidata[] = [];
  entrada.condiciones
    .filter(
      (c) =>
        c.CLIENTE === cliente.codigo &&
        estadoRegla(c.ACTIVA, c.FECHA_INICIO, c.FECHA_FIN, fecha) === "VIGENTE" &&
        coincideAlcance(c.ALCANCE, c.VALOR, articulo) &&
        cumpleCantidad(c.CANTIDAD_MIN)
    )
    .forEach((c) =>
      candidatas.push({
        ORIGEN: "CONDICION",
        ID: c.ID,
        DESCRIPCION: describirCondicion(c),
        DESCUENTO: c.DESCUENTO_MAX,
        PRECIO_ESPECIAL: c.PRECIO_ESPECIAL,
        PRECIO_RESULTANTE: resultante(c.DESCUENTO_MAX, c.PRECIO_ESPECIAL),
      })
    );

  const dirigida = (p: IPromocion) =>
    p.DESTINO === "T" ||
    p.destinos.some(
      (d) =>
        (d.TIPO === "C" && d.VALOR === cliente.codigo) ||
        (d.TIPO === "R" && cliente.rutas.includes(d.VALOR)) ||
        (d.TIPO === "K" && !!cliente.tipo && d.VALOR === cliente.tipo)
    );

  const bonificaciones: IBonificacion[] = [];
  entrada.promociones
    .filter(
      (p) =>
        estadoRegla(p.ACTIVA, p.FECHA_INICIO, p.FECHA_FIN, fecha) === "VIGENTE" && dirigida(p)
    )
    .forEach((p) => {
      const productos = p.productos.filter((x) => coincideAlcance(x.ALCANCE, x.VALOR, articulo));
      if (!productos.length) return;
      if (p.TIPO === "B") {
        bonificaciones.push({
          PROMOCION_ID: p.ID,
          DESCRIPCION: p.TITULO,
          CANTIDAD_MIN: productos[0].CANTIDAD_MIN,
          ARTICULO: p.ARTICULO_BONIFICADO,
          ARTICULO_DESCRIPCION: p.ARTICULO_BONIFICADO_DESCRIPCION,
          CANTIDAD: p.CANTIDAD_BONIFICADA,
        });
        return;
      }
      productos
        .filter((x) => cumpleCantidad(x.CANTIDAD_MIN))
        .forEach((x) =>
          candidatas.push({
            ORIGEN: "PROMOCION",
            ID: p.ID,
            DESCRIPCION: p.TITULO,
            DESCUENTO: p.TIPO === "D" ? x.DESCUENTO : null,
            PRECIO_ESPECIAL: p.TIPO === "P" ? x.PRECIO_ESPECIAL : null,
            PRECIO_RESULTANTE: resultante(
              p.TIPO === "D" ? x.DESCUENTO : null,
              p.TIPO === "P" ? x.PRECIO_ESPECIAL : null
            ),
          })
        );
    });

  const aplicada = candidatas.length
    ? candidatas.reduce((mejor, c) => (c.PRECIO_RESULTANTE < mejor.PRECIO_RESULTANTE ? c : mejor))
    : null;
  const final = aplicada ? aplicada.PRECIO_RESULTANTE : redondear(precioBase);
  return {
    CLIENTE: cliente.codigo,
    ARTICULO: articulo.codigo,
    ARTICULO_DESCRIPCION: articulo.descripcion,
    LINEA: articulo.linea,
    NIVEL_PRECIO: entrada.nivelPrecio ?? null,
    FECHA: fecha,
    PRECIO_BASE: redondear(precioBase),
    IVA,
    PRECIO_FINAL: final,
    PRECIO_FINAL_IVA: redondear(final * (1 + IVA)),
    REGLA_APLICADA: aplicada,
    REGLAS_CANDIDATAS: candidatas.sort((a, b) => a.PRECIO_RESULTANTE - b.PRECIO_RESULTANTE),
    BONIFICACIONES: bonificaciones,
  };
};
