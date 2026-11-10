import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import {
  anchoUtilPdf,
  encabezadoPdfFr,
  estilosPdfFr,
  layoutTablaPdfFr,
  piePdfFr,
} from "./pdf-tema-fr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

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

const MARGEN = 30;

const tablaSeccion = (seccion: ISeccionPdf): Content[] => {
  const salida: Content[] = [];
  if (seccion.titulo) {
    salida.push({ text: seccion.titulo, style: "seccion" });
  }
  if (!seccion.filas.length) {
    salida.push({
      text: seccion.vacio ?? "Sin registros para los filtros indicados.",
      italics: true,
      color: "#888",
      fontSize: 9,
      margin: [4, 0, 0, 10],
    });
    return salida;
  }
  const header: TableCell[] = seccion.columnas.map((c) => ({
    text: c.header,
    style: "th",
    alignment: c.alignment ?? "left",
  }));
  const body: TableCell[][] = seccion.filas.map((fila) =>
    seccion.columnas.map((c) => {
      const v = c.valor(fila);
      return {
        text: v == null ? "" : String(v),
        alignment: c.alignment ?? "left",
      };
    })
  );
  salida.push({
    table: {
      headerRows: 1,
      widths: seccion.columnas.map((c) => c.width ?? "auto"),
      body: [header, ...body],
    },
    layout: layoutTablaPdfFr,
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
  const horizontal = !!reporte.horizontal;
  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageOrientation: horizontal ? "landscape" : "portrait",
    pageMargins: [MARGEN, MARGEN, MARGEN, 40],
    info: { title: reporte.titulo },
    defaultStyle: { font: "Roboto", fontSize: 9 },
    styles: estilosPdfFr,
    footer: piePdfFr(MARGEN, MARGEN),
    content: [
      ...encabezadoPdfFr(
        reporte.titulo,
        anchoUtilPdf(horizontal, MARGEN, MARGEN),
        reporte.filtros
      ),
      ...reporte.secciones.flatMap(tablaSeccion),
    ],
  };
  pdfMake.createPdf(docDefinition).open({}, ventana);
};
