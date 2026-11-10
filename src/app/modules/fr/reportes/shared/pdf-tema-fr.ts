import { Content, CustomTableLayout, StyleDictionary } from "pdfmake/interfaces";

// Tema único de los PDF del módulo FR. Toma los colores y la estructura del
// "Reporte de Asignación de Ruta": título azul con fecha a la derecha, línea azul,
// recuadro celeste con los datos/filtros y tablas con encabezado azul y filas alternas.
export const PDF_COLOR_PRIMARIO = "#1f3864";
export const PDF_COLOR_FONDO = "#e8edf5";
export const PDF_COLOR_CEBRA = "#f5f7fb";
export const PDF_COLOR_LINEA = "#d0d7e5";
export const PDF_COLOR_TENUE = "#888888";

/** Ancho útil de una hoja carta según orientación y márgenes izquierdo/derecho. */
export const anchoUtilPdf = (horizontal: boolean, margenIzq: number, margenDer: number): number =>
  (horizontal ? 792 : 612) - margenIzq - margenDer;

export const estilosPdfFr: StyleDictionary = {
  titulo: { fontSize: 16, bold: true, color: PDF_COLOR_PRIMARIO },
  modulo: { fontSize: 8, color: PDF_COLOR_TENUE },
  seccion: {
    fontSize: 11,
    bold: true,
    color: PDF_COLOR_PRIMARIO,
    margin: [0, 4, 0, 4],
  },
  th: { bold: true, color: "#ffffff" },
};

/** Tablas: encabezado azul, filas alternas suaves y líneas horizontales finas. */
export const layoutTablaPdfFr: CustomTableLayout = {
  fillColor: (fila: number) =>
    fila === 0 ? PDF_COLOR_PRIMARIO : fila % 2 === 0 ? PDF_COLOR_CEBRA : null,
  hLineWidth: () => 0.5,
  vLineWidth: () => 0,
  hLineColor: () => PDF_COLOR_LINEA,
  paddingTop: () => 3,
  paddingBottom: () => 3,
};

// "Etiqueta: valor" -> etiqueta en negrita azul (solo si la etiqueta es corta).
const lineaInfo = (texto: string): Content => {
  const i = texto.indexOf(":");
  if (i > 0 && i <= 30) {
    return {
      text: [
        { text: texto.slice(0, i + 1), bold: true, color: PDF_COLOR_PRIMARIO },
        { text: texto.slice(i + 1) },
      ],
    };
  }
  return { text: texto };
};

/** Encabezado común: título + fecha/hora, línea azul y recuadro celeste con las líneas de info. */
export const encabezadoPdfFr = (
  titulo: string,
  ancho: number,
  lineas: string[],
  pageBreak?: "before"
): Content[] => {
  const salida: Content[] = [
    {
      columns: [
        {
          stack: [
            { text: "Facturación de Rutero", style: "modulo" },
            { text: titulo, style: "titulo" },
          ],
        },
        {
          text: new Date().toLocaleString("es-SV"),
          alignment: "right",
          fontSize: 8,
          color: "#666",
          margin: [0, 14, 0, 0],
          width: 140,
        },
      ],
      pageBreak,
    },
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 4,
          x2: ancho,
          y2: 4,
          lineWidth: 1.5,
          lineColor: PDF_COLOR_PRIMARIO,
        },
      ],
      margin: [0, 0, 0, 10],
    },
  ];
  if (lineas.length) {
    salida.push({
      table: {
        widths: ["*"],
        body: lineas.map((l) => [lineaInfo(l)]),
      },
      layout: {
        fillColor: () => PDF_COLOR_FONDO,
        hLineColor: () => "#ffffff",
        vLineColor: () => "#ffffff",
        paddingTop: () => 3,
        paddingBottom: () => 3,
      },
      fontSize: 9,
      margin: [0, 0, 0, 12],
    });
  }
  return salida;
};

/** Pie: "Página x de y" a la derecha (igual que Asignación de Ruta). */
export const piePdfFr =
  (margenIzq: number, margenDer: number) =>
  (pagina: number, total: number): Content => ({
    columns: [
      { text: "Facturación de Rutero", margin: [margenIzq, 10, 0, 0] },
      {
        text: `Página ${pagina} de ${total}`,
        alignment: "right",
        margin: [0, 10, margenDer, 0],
      },
    ],
    fontSize: 8,
    color: PDF_COLOR_TENUE,
  });
