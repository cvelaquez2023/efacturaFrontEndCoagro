import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { IColumnaPdf } from "./reporte-pdf";
import {
  anchoUtilPdf,
  encabezadoPdfFr,
  estilosPdfFr,
  layoutTablaPdfFr,
  PDF_COLOR_FONDO,
  PDF_COLOR_PRIMARIO,
  piePdfFr,
} from "./pdf-tema-fr";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

/** Recuadro con título y tabla (p. ej. "Resumen del Día", "Visitas sin Ventas", ...).
 *  Usa el mismo tema azul que el reporte de Asignación de Ruta. */
export interface IRecuadroPdf {
  titulo: string;
  columnas: IColumnaPdf[];
  filas: unknown[];
  /** Texto de la fila "Total:" al pie (p. ej. la cantidad de filas). */
  total?: string;
  vacio?: string;
  /** Se mantiene por compatibilidad: todas las tablas ya llevan filas alternas. */
  cebra?: boolean;
}

/** Fila de bloques: uno ocupa todo el ancho, dos van lado a lado. */
export type FilaBloquesPdf = IRecuadroPdf[];

export interface IPaginaRuteroPdf {
  /** Líneas del encabezado (fechas, ruta, moneda...). */
  encabezado: string[];
  bloques: FilaBloquesPdf[];
}

export interface IReporteRuteroPdf {
  titulo: string;
  /** Una "página lógica" por grupo (p. ej. por ruta); cada una empieza en hoja nueva. */
  paginas: IPaginaRuteroPdf[];
  horizontal?: boolean;
}

export const fmtMonto = (valor: number | null | undefined): string =>
  valor == null
    ? ""
    : valor.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export const fmtPorcentaje = (valor: number | null | undefined): string =>
  valor == null || !isFinite(valor) ? "" : `${fmtMonto(valor)}%`;

const MARGEN = 30;

const recuadro = (r: IRecuadroPdf): Content => {
  const header: TableCell[] = r.columnas.map((c) => ({
    text: c.header,
    style: "th",
    alignment: c.alignment ?? "left",
  }));
  const body: TableCell[][] = r.filas.map((fila) =>
    r.columnas.map((c) => {
      const v = c.valor(fila);
      return {
        text: v == null ? "" : String(v),
        alignment: c.alignment ?? "left",
      };
    })
  );
  if (!body.length) {
    body.push([
      {
        text: r.vacio ?? "Sin registros.",
        italics: true,
        color: "#888",
        colSpan: r.columnas.length,
      },
      ...r.columnas.slice(1).map((): TableCell => ""),
    ]);
  }
  if (r.total != null) {
    const filaTotal: TableCell[] = [
      { text: "Total:", bold: true, color: PDF_COLOR_PRIMARIO, fillColor: PDF_COLOR_FONDO },
    ];
    if (r.columnas.length > 1) {
      filaTotal.push(
        {
          text: r.total,
          bold: true,
          colSpan: r.columnas.length - 1,
          fillColor: PDF_COLOR_FONDO,
        },
        ...r.columnas.slice(2).map((): TableCell => "")
      );
    } else {
      filaTotal[0] = {
        text: `Total: ${r.total}`,
        bold: true,
        color: PDF_COLOR_PRIMARIO,
        fillColor: PDF_COLOR_FONDO,
      };
    }
    body.push(filaTotal);
  }
  return {
    stack: [
      { text: r.titulo, style: "seccion" },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: r.columnas.map((c) => c.width ?? "auto"),
          body: [header, ...body],
        },
        layout: layoutTablaPdfFr,
      },
    ],
    margin: [0, 0, 0, 12],
  };
};

const filaBloques = (fila: FilaBloquesPdf): Content =>
  fila.length === 1
    ? recuadro(fila[0])
    : { columns: fila.map(recuadro), columnGap: 18 };

/** Abre un reporte "Generar Reporte" del módulo FR (encabezado + recuadros) con el tema azul
 *  común. `ventana` igual que abrirReportePdf. */
export const abrirReporteRuteroPdf = (
  reporte: IReporteRuteroPdf,
  ventana: Window | null = null
): void => {
  const horizontal = reporte.horizontal !== false;
  const ancho = anchoUtilPdf(horizontal, MARGEN, MARGEN);
  const content: Content[] = [];
  reporte.paginas.forEach((pagina, i) => {
    content.push(
      ...encabezadoPdfFr(
        reporte.titulo,
        ancho,
        pagina.encabezado,
        i > 0 ? "before" : undefined
      )
    );
    pagina.bloques.forEach((f) => content.push(filaBloques(f)));
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageOrientation: horizontal ? "landscape" : "portrait",
    pageMargins: [MARGEN, MARGEN, MARGEN, 40],
    info: { title: reporte.titulo },
    defaultStyle: { font: "Roboto", fontSize: 8 },
    styles: estilosPdfFr,
    footer: piePdfFr(MARGEN, MARGEN),
    content,
  };
  pdfMake.createPdf(docDefinition).open({}, ventana);
};
