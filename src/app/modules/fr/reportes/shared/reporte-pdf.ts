import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { fmtFechaHora } from "./reporte-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

const COLOR_PRIMARIO = "#1f3864";
const COLOR_FONDO = "#e8edf5";

export interface IColumnaPdf {
  header: string;
  valor: (fila: any) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
  width?: number | string;
  alignment?: "left" | "right" | "center";
}

export interface ISeccionPdf {
  titulo?: string;
  columnas: IColumnaPdf[];
  filas: unknown[];
  vacio?: string;
}

export interface IReportePdf {
  titulo: string;
  /** Líneas de filtros aplicados, p. ej. "Fechas: 01/10/2026 al 22/10/2026". */
  filtros: string[];
  secciones: ISeccionPdf[];
  horizontal?: boolean;
}

const tablaSeccion = (seccion: ISeccionPdf): Content[] => {
  const salida: Content[] = [];
  if (seccion.titulo) {
    salida.push({ text: seccion.titulo, style: "seccion" });
  }
  if (!seccion.filas.length) {
    salida.push({
      text: seccion.vacio ?? "Sin registros para los filtros indicados.",
      italics: true,
      color: "#666",
      margin: [0, 0, 0, 10],
    });
    return salida;
  }
  const header: TableCell[] = seccion.columnas.map((c) => ({
    text: c.header,
    style: "th",
    fillColor: COLOR_PRIMARIO,
  }));
  const body: TableCell[][] = seccion.filas.map((fila, i) =>
    seccion.columnas.map((c) => {
      const v = c.valor(fila);
      return {
        text: v == null ? "" : String(v),
        alignment: c.alignment ?? "left",
        fillColor: i % 2 ? COLOR_FONDO : undefined,
      };
    })
  );
  salida.push({
    table: {
      headerRows: 1,
      widths: seccion.columnas.map((c) => c.width ?? "auto"),
      body: [header, ...body],
    },
    layout: "noBorders",
    fontSize: 8,
    margin: [0, 0, 0, 12],
  });
  return salida;
};

/** Arma un PDF tabular simple (título, filtros, una o varias tablas) y lo abre en `ventana`.
 *  `ventana` debe abrirse de forma síncrona en el click (window.open) para que el bloqueador de
 *  ventanas emergentes no la bloquee; si es null, pdfmake abre una nueva. */
export const abrirReportePdf = (
  reporte: IReportePdf,
  ventana: Window | null = null
): void => {
  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageOrientation: reporte.horizontal ? "landscape" : "portrait",
    pageMargins: [30, 30, 30, 40],
    info: { title: reporte.titulo },
    defaultStyle: { font: "Roboto", fontSize: 9 },
    styles: {
      titulo: { fontSize: 15, bold: true, color: COLOR_PRIMARIO },
      seccion: {
        fontSize: 11,
        bold: true,
        color: COLOR_PRIMARIO,
        margin: [0, 6, 0, 4],
      },
      th: { bold: true, color: "#ffffff" },
    },
    footer: (pagina: number, total: number) => ({
      columns: [
        { text: `Generado: ${fmtFechaHora(new Date())}`, margin: [30, 10, 0, 0] },
        {
          text: `Página ${pagina} de ${total}`,
          alignment: "right",
          margin: [0, 10, 30, 0],
        },
      ],
      fontSize: 8,
      color: "#888",
    }),
    content: [
      { text: "Facturación de Rutero", color: "#888", fontSize: 9 },
      { text: reporte.titulo, style: "titulo", margin: [0, 0, 0, 4] },
      ...reporte.filtros.map(
        (f): Content => ({ text: f, fontSize: 9, color: "#444" })
      ),
      { text: " ", margin: [0, 0, 0, 4] },
      ...reporte.secciones.flatMap(tablaSeccion),
    ],
  };
  pdfMake.createPdf(docDefinition).open({}, ventana);
};
