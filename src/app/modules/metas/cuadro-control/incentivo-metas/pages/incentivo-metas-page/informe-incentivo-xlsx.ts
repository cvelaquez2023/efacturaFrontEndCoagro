/**
 * Excel del informe "META E INCENTIVO · MES · VENDEDOR" con el mismo diseño y fórmulas que el libro
 * de COAGRO (2026-10_Meta-Incentivo_Baudilio-1.xlsx):
 *  - Fila 1: título; "% mínimo para cobrar" editable (todo se recalcula al cambiarlo).
 *  - Filas 4-11: RESUMEN con fórmulas (SUBTOTAL, COUNTIF…).
 *  - Fila 13: encabezados (semanas en verde); desde la 14 los productos agrupados por línea de negocio
 *    (con su líder), cada grupo cerrado por una fila "Subtotal <línea>" en azul claro.
 *    Mínimo = ROUNDUP(base × %), Vendido = suma de semanas, Avance (barra), Faltan (✓ al llegar),
 *    Estado (colores), Incentivo ganado = vendido × $ si llega al mínimo, Incentivo a meta = meta × $.
 *  - Subtotales y TOTAL con SUBTOTAL(9, …): el TOTAL no vuelve a sumar los subtotales.
 *  - Fila TOTAL azul y nota "PENDIENTE DE CONFIRMACIÓN" si hay productos sin incentivo.
 *  - Encabezado y 2 columnas inmovilizados, autofiltro, sin cuadrícula, ajustado a una página.
 */
import { letraColumna } from "../../../../metas-shared/escribir-xlsx";
import { crearXlsxRico, ICeldaRica, IHojaRica } from "../../../../metas-shared/escribir-xlsx-rico";
import { cfBarraAvance, cfEstado, E, ESTILOS_INFORME_XML } from "../../../../metas-shared/estilos-informe-xlsx";

export interface IFilaInformeXlsx {
  codigo: string;
  producto: string;
  /** Código del proveedor de la meta (CALOX, BAYER VE…). */
  proveedor: string;
  /** Línea de negocio (Veterinaria 1…). */
  linea: string;
  lider: string;
  incentivo: number;
  meta: number;
  /** Base del mínimo (el mínimo cargado; igual a la meta si no se indicó). */
  minimoBase: number;
  /** Mínimo ya aplicado el % (ROUNDUP(base × %)). */
  minimo: number;
  semanas: number[];
  vendido: number;
  avance: number;
  faltan: number;
  estadoTexto: string;
  ganado: number;
  aMeta: number;
}

/** Productos de una línea de negocio (se cierran con su fila de subtotal). */
export interface IGrupoInformeXlsx {
  linea: string;
  lider: string;
  filas: IFilaInformeXlsx[];
}

export interface IDatosInformeXlsx {
  titulo: string;
  /** % mínimo para cobrar (100 = 100 %). */
  pct: number;
  /** Encabezados de semana: "Sem 1\n2–7 nov". */
  semanas: string[];
  grupos: IGrupoInformeXlsx[];
  resumen: {
    meta: number;
    vendido: number;
    avance: number;
    incentivoAlCien: number;
    ganado: number;
    conMetaCumplida: number;
    productos: number;
  };
  /** Texto de la nota de pendientes (null = sin nota). */
  notaPendiente: string | null;
}

const FILA_ENC = 13;

export const crearInformeIncentivoXlsx = (d: IDatosInformeXlsx): Blob => {
  const n = d.semanas.length;
  // Columnas (0 = A)
  const c = {
    codigo: 0,
    producto: 1,
    proveedor: 2,
    linea: 3,
    lider: 4,
    incentivo: 5,
    meta: 6,
    minimo: 7,
    sem0: 8,
    vendido: 8 + n,
    avance: 9 + n,
    faltan: 10 + n,
    estado: 11 + n,
    ganado: 12 + n,
    aMeta: 13 + n,
  };
  const L = (col: number) => letraColumna(col);
  const productos = d.grupos.reduce((t, g) => t + g.filas.length, 0);
  const filasDatos = productos + d.grupos.filter((g) => g.filas.length).length;
  const primera = FILA_ENC + 1;
  const ultima = FILA_ENC + Math.max(filasDatos, 1);
  const filaTotal = ultima + 1;
  const pctRef = `$${L(c.avance)}$1`;
  const rango = (col: number) => `${L(col)}${primera}:${L(col)}${ultima}`;
  const subtotal = (col: number, desde = primera, hasta = ultima) => `SUBTOTAL(9,${L(col)}${desde}:${L(col)}${hasta})`;

  const hoja: (ICeldaRica | null)[][] = [];
  const poner = (fila: number, col: number, celda: ICeldaRica) => {
    (hoja[fila - 1] ??= [])[col] = celda;
  };

  // ---------- Encabezado del informe
  poner(1, 0, { v: d.titulo, s: E.TITULO });
  poner(1, c.vendido, { v: "% mínimo para cobrar", s: E.ETIQUETA_GRIS });
  poner(1, c.avance, { v: d.pct / 100, s: E.PCT_AZUL });

  // ---------- Resumen (filas 4-11)
  const r = d.resumen;
  poner(4, 0, { v: "RESUMEN", s: E.RESUMEN_TITULO });
  const resumen: [string, ICeldaRica, boolean][] = [
    ["Meta total (unidades)", { f: subtotal(c.meta), v: r.meta, s: E.RES_ENTERO }, false],
    ["Vendido a la fecha (unidades)", { f: subtotal(c.vendido), v: r.vendido, s: E.RES_ENTERO }, false],
    ["Avance total", { f: "IFERROR(C6/C5,0)", v: r.avance, s: E.RES_PCT }, false],
    ["Incentivo si cumples todo al 100 %", { f: subtotal(c.aMeta), v: r.incentivoAlCien, s: E.RES_MONEDA }, false],
    ["Incentivo ganado a la fecha", { f: subtotal(c.ganado), v: r.ganado, s: E.RES_MONEDA_VERDE }, true],
    [
      "PRODUCTOS CON META CUMPLIDA",
      {
        f: `COUNTIF(${rango(c.estado)},"Ya paga")+COUNTIF(${rango(c.estado)},"Meta cumplida")`,
        v: r.conMetaCumplida,
        s: E.RES_ENTERO,
      },
      false,
    ],
    // Las filas de subtotal no tienen código: COUNTA del código cuenta solo productos.
    ["Productos con meta", { f: `COUNTA(${rango(c.codigo)})`, v: r.productos, s: E.RES_ENTERO }, false],
  ];
  resumen.forEach(([etiqueta, valor, verde], i) => {
    const fila = 5 + i;
    const s = verde ? E.RES_ETIQUETA_VERDE : E.RES_ETIQUETA;
    poner(fila, 0, { v: etiqueta, s });
    poner(fila, 1, { s });
    poner(fila, 2, valor);
  });

  // ---------- Encabezados de la tabla
  const encabezados: [number, string, number][] = [
    [c.codigo, "Código", E.ENC],
    [c.producto, "Producto", E.ENC],
    [c.proveedor, "Proveedor", E.ENC],
    [c.linea, "Línea", E.ENC],
    [c.lider, "Líder", E.ENC],
    [c.incentivo, "$ por unidad", E.ENC],
    [c.meta, "Meta (u)", E.ENC],
    [c.minimo, `MÍNIMO ${d.pct} % (U)`, E.ENC],
    ...d.semanas.map((t, i): [number, string, number] => [c.sem0 + i, t, E.ENC_SEMANA]),
    [c.vendido, "Vendido (u)", E.ENC],
    [c.avance, "Avance", E.ENC],
    [c.faltan, `FALTAN PARA ${d.pct} % (U)`, E.ENC],
    [c.estado, "Estado", E.ENC],
    [c.ganado, "Incentivo ganado", E.ENC],
    [c.aMeta, "Incentivo a meta", E.ENC],
  ];
  encabezados.forEach(([col, texto, s]) => poner(FILA_ENC, col, { v: texto, s }));

  // ---------- Detalle por línea (filas alternas con fondo gris) + subtotal de cada línea
  let fila = primera;
  d.grupos
    .filter((g) => g.filas.length)
    .forEach((g) => {
      const desde = fila;
      g.filas.forEach((f, i) => {
        const alt = i % 2 === 1;
        const est = (normal: number, alterno: number) => (alt ? alterno : normal);
        const sem = (k: number) => `${L(c.sem0 + k)}${fila}`;
        poner(fila, c.codigo, { v: f.codigo, s: est(E.CODIGO, E.CODIGO_ALT) });
        poner(fila, c.producto, { v: f.producto, s: est(E.TEXTO, E.TEXTO_ALT) });
        poner(fila, c.proveedor, { v: f.proveedor, s: est(E.TEXTO, E.TEXTO_ALT) });
        poner(fila, c.linea, { v: f.linea, s: est(E.TEXTO, E.TEXTO_ALT) });
        poner(fila, c.lider, { v: f.lider, s: est(E.TEXTO, E.TEXTO_ALT) });
        poner(fila, c.incentivo, { v: f.incentivo || null, s: est(E.INCENTIVO, E.INCENTIVO_ALT) });
        poner(fila, c.meta, { v: f.meta, s: est(E.META, E.META_ALT) });
        poner(fila, c.minimo, {
          f: `ROUNDUP(${f.minimoBase}*${pctRef},0)`,
          v: f.minimo,
          s: est(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT),
        });
        f.semanas.forEach((x, k) => poner(fila, c.sem0 + k, { v: x || null, s: E.SEMANA }));
        poner(fila, c.vendido, {
          f: n ? `SUM(${sem(0)}:${sem(n - 1)})` : "0",
          v: f.vendido,
          s: est(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT),
        });
        const V = `${L(c.vendido)}${fila}`;
        const M = `${L(c.meta)}${fila}`;
        const Mi = `${L(c.minimo)}${fila}`;
        const I = `${L(c.incentivo)}${fila}`;
        poner(fila, c.avance, { f: `IFERROR(${V}/${M},0)`, v: f.avance, s: est(E.PCT, E.PCT_ALT) });
        poner(fila, c.faltan, { f: `MAX(0,${Mi}-${V})`, v: f.faltan, s: est(E.FALTAN, E.FALTAN_ALT) });
        poner(fila, c.estado, {
          f: `IF(${V}>=${M},"Meta cumplida",IF(${V}>=${Mi},"Ya paga","Aún no paga"))`,
          v: f.estadoTexto,
          s: est(E.TEXTO, E.TEXTO_ALT),
        });
        poner(fila, c.ganado, {
          f: `IFERROR(IF(${V}>=${Mi},${V}*${I},0),0)`,
          v: f.ganado,
          s: est(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT),
        });
        poner(fila, c.aMeta, { f: `IFERROR(${M}*${I},0)`, v: f.aMeta, s: est(E.MONEDA, E.MONEDA_ALT) });
        fila++;
      });

      // Subtotal de la línea
      const hasta = fila - 1;
      const suma = (fn: (f: IFilaInformeXlsx) => number) => g.filas.reduce((t, f) => t + fn(f), 0);
      const sub = (col: number, v: number, s: number = E.SUB_ENTERO) => poner(fila, col, { f: subtotal(col, desde, hasta), v, s });
      for (let col = 0; col <= c.aMeta; col++) poner(fila, col, { s: E.SUB_TEXTO });
      poner(fila, c.producto, { v: `Subtotal ${g.linea} (${g.filas.length} productos)`, s: E.SUB_TEXTO });
      poner(fila, c.linea, { v: g.linea, s: E.SUB_TEXTO });
      poner(fila, c.lider, { v: g.lider, s: E.SUB_TEXTO });
      const metaG = suma((f) => f.meta);
      const vendG = suma((f) => f.vendido);
      sub(c.meta, metaG);
      sub(c.minimo, suma((f) => f.minimo));
      d.semanas.forEach((_, k) => sub(c.sem0 + k, suma((f) => f.semanas[k] || 0)));
      sub(c.vendido, vendG);
      poner(fila, c.avance, {
        f: `IFERROR(${L(c.vendido)}${fila}/${L(c.meta)}${fila},0)`,
        v: metaG ? vendG / metaG : 0,
        s: E.SUB_PCT,
      });
      sub(c.ganado, suma((f) => f.ganado), E.SUB_MONEDA);
      sub(c.aMeta, suma((f) => f.aMeta), E.SUB_MONEDA);
      fila++;
    });

  // ---------- TOTAL (SUBTOTAL ignora las filas de subtotal de cada línea)
  const sumaCol = (col: number, v: number, s: number) => poner(filaTotal, col, { f: subtotal(col), v, s });
  const todas = d.grupos.flatMap((g) => g.filas);
  for (let col = 0; col <= c.aMeta; col++) poner(filaTotal, col, { s: E.TOTAL_VACIO });
  poner(filaTotal, c.producto, { v: "TOTAL", s: E.TOTAL_TEXTO });
  sumaCol(c.meta, r.meta, E.TOTAL_ENTERO);
  sumaCol(c.minimo, todas.reduce((t, f) => t + f.minimo, 0), E.TOTAL_ENTERO);
  d.semanas.forEach((_, k) => sumaCol(c.sem0 + k, todas.reduce((t, f) => t + (f.semanas[k] || 0), 0), E.TOTAL_ENTERO));
  sumaCol(c.vendido, r.vendido, E.TOTAL_ENTERO);
  poner(filaTotal, c.avance, {
    f: `IFERROR(${L(c.vendido)}${filaTotal}/${L(c.meta)}${filaTotal},0)`,
    v: r.avance,
    s: E.TOTAL_PCT,
  });
  sumaCol(c.ganado, r.ganado, E.TOTAL_MONEDA);
  sumaCol(c.aMeta, r.incentivoAlCien, E.TOTAL_MONEDA);

  // ---------- Nota de pendientes
  const combinar = [5, 6, 7, 8, 9, 10, 11].map((f) => `A${f}:B${f}`);
  const altos: Record<number, number> = { 1: 23.25, [FILA_ENC]: 33.75 };
  [5, 6, 7, 8, 9, 10, 11].forEach((f) => (altos[f] = 15.75));
  if (d.notaPendiente) {
    const filaNota = filaTotal + 2;
    poner(filaNota, 0, { v: "PENDIENTE DE CONFIRMACIÓN", s: E.NOTA_TITULO });
    poner(filaNota + 1, 0, { v: d.notaPendiente, s: E.NOTA });
    combinar.push(`A${filaNota + 1}:${L(c.aMeta)}${filaNota + 1}`);
    altos[filaNota + 1] = 30;
  }

  const definicion: IHojaRica = {
    nombre: "Meta e incentivo",
    filas: hoja,
    anchos: [8, 30, 11, 16, 14, 10, 9, 10, ...d.semanas.map(() => 9), 10, 10, 11, 14, 12, 12],
    altos,
    combinar,
    fijar: { columnas: 2, filas: FILA_ENC },
    autoFiltro: `A${FILA_ENC}:${L(c.aMeta)}${ultima}`,
    formatoCondicionalXml: cfBarraAvance(rango(c.avance)) + cfEstado(rango(c.estado)),
    sinCuadricula: true,
    ajustarPagina: true,
    filasTituloImpresion: `$${FILA_ENC}:$${FILA_ENC}`,
  };
  return crearXlsxRico([definicion], ESTILOS_INFORME_XML);
};
