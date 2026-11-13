/**
 * Excel del informe "META E INCENTIVO · MES · VENDEDOR" con el mismo diseño y fórmulas que el libro
 * de COAGRO (2026-10_Meta-Incentivo_Baudilio-1.xlsx):
 *  - Fila 1: título; "% mínimo para cobrar" editable (todo se recalcula al cambiarlo).
 *  - Filas 4-11: RESUMEN con fórmulas (SUM, COUNTIF…).
 *  - Fila 13: encabezados (semanas en verde); desde la 14 un producto por fila con filas alternas.
 *    Mínimo = ROUNDUP(base × %), Vendido = suma de semanas, Avance (barra), Faltan (✓ al llegar),
 *    Estado (colores), Incentivo ganado = vendido × $ si llega al mínimo, Incentivo a meta = meta × $.
 *  - Fila TOTAL azul y nota "PENDIENTE DE CONFIRMACIÓN" si hay productos sin incentivo.
 *  - Encabezado y 2 columnas inmovilizados, autofiltro, sin cuadrícula, ajustado a una página.
 */
import { letraColumna } from "../../../../metas-shared/escribir-xlsx";
import { crearXlsxRico, ICeldaRica, IHojaRica } from "../../../../metas-shared/escribir-xlsx-rico";
import { cfBarraAvance, cfEstado, E, ESTILOS_INFORME_XML } from "../../../../metas-shared/estilos-informe-xlsx";

export interface IFilaInformeXlsx {
  codigo: string;
  producto: string;
  /** Columna "Línea" del libro (el código del proveedor: CALOX, BAYER VE…). */
  linea: string;
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

export interface IDatosInformeXlsx {
  titulo: string;
  /** % mínimo para cobrar (100 = 100 %). */
  pct: number;
  /** Encabezados de semana: "Sem 1\n2–7 nov". */
  semanas: string[];
  filas: IFilaInformeXlsx[];
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
    linea: 2,
    incentivo: 3,
    meta: 4,
    minimo: 5,
    sem0: 6,
    vendido: 6 + n,
    avance: 7 + n,
    faltan: 8 + n,
    estado: 9 + n,
    ganado: 10 + n,
    aMeta: 11 + n,
  };
  const L = (col: number) => letraColumna(col);
  const primera = FILA_ENC + 1;
  const ultima = FILA_ENC + Math.max(d.filas.length, 1);
  const filaTotal = ultima + 1;
  const pctRef = `$${L(c.avance)}$1`;
  const rango = (col: number) => `${L(col)}${primera}:${L(col)}${ultima}`;

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
    ["Meta total (unidades)", { f: `SUM(${rango(c.meta)})`, v: r.meta, s: E.RES_ENTERO }, false],
    ["Vendido a la fecha (unidades)", { f: `SUM(${rango(c.vendido)})`, v: r.vendido, s: E.RES_ENTERO }, false],
    ["Avance total", { f: "IFERROR(C6/C5,0)", v: r.avance, s: E.RES_PCT }, false],
    ["Incentivo si cumples todo al 100 %", { f: `SUM(${rango(c.aMeta)})`, v: r.incentivoAlCien, s: E.RES_MONEDA }, false],
    ["Incentivo ganado a la fecha", { f: `SUM(${rango(c.ganado)})`, v: r.ganado, s: E.RES_MONEDA_VERDE }, true],
    [
      "PRODUCTOS CON META CUMPLIDA",
      {
        f: `COUNTIF(${rango(c.estado)},"Ya paga")+COUNTIF(${rango(c.estado)},"Meta cumplida")`,
        v: r.conMetaCumplida,
        s: E.RES_ENTERO,
      },
      false,
    ],
    ["Productos con meta", { f: `COUNTA(${rango(c.producto)})`, v: r.productos, s: E.RES_ENTERO }, false],
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
    [c.linea, "Línea", E.ENC],
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

  // ---------- Detalle (filas alternas con fondo gris)
  d.filas.forEach((f, i) => {
    const fila = primera + i;
    const alt = i % 2 === 1;
    const est = (normal: number, alterno: number) => (alt ? alterno : normal);
    const sem = (k: number) => `${L(c.sem0 + k)}${fila}`;
    poner(fila, c.codigo, { v: f.codigo, s: est(E.CODIGO, E.CODIGO_ALT) });
    poner(fila, c.producto, { v: f.producto, s: est(E.TEXTO, E.TEXTO_ALT) });
    poner(fila, c.linea, { v: f.linea, s: est(E.TEXTO, E.TEXTO_ALT) });
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
  });

  // ---------- TOTAL
  const sumaCol = (col: number, v: number, s: number) =>
    poner(filaTotal, col, { f: `SUM(${rango(col)})`, v, s });
  for (let col = 0; col <= c.aMeta; col++) poner(filaTotal, col, { s: E.TOTAL_VACIO });
  poner(filaTotal, c.producto, { v: "TOTAL", s: E.TOTAL_TEXTO });
  sumaCol(c.meta, r.meta, E.TOTAL_ENTERO);
  sumaCol(c.minimo, d.filas.reduce((t, f) => t + f.minimo, 0), E.TOTAL_ENTERO);
  d.semanas.forEach((_, k) =>
    sumaCol(c.sem0 + k, d.filas.reduce((t, f) => t + (f.semanas[k] || 0), 0), E.TOTAL_ENTERO)
  );
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
    anchos: [8, 30, 10, 10, 9, 10, ...d.semanas.map(() => 9), 10, 10, 11, 14, 12, 12],
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
