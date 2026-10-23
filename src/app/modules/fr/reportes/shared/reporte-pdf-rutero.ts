import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { formatDate } from "@angular/common";
import { IColumnaPdf } from "./reporte-pdf";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

const GRIS_BARRA = "#9e9e9e";
const GRIS_FILA = "#e6e6e6";

/** Recuadro con título centrado en mayúsculas y barra gris de encabezados (estilo de los
 *  reportes de Softland FR: "RESUMEN DEL DÍA", "VISITAS SIN VENTAS", ...). */
export interface IRecuadroPdf {
  titulo: string;
  columnas: IColumnaPdf[];
  filas: unknown[];
  /** Texto de la fila "Total:" al pie (p. ej. la cantidad de filas). */
  total?: string;
  vacio?: string;
  /** Alterna gris/blanco en las filas (como el resumen del ejemplo). */
  cebra?: boolean;
}

/** Fila de bloques: uno ocupa todo el ancho, dos van lado a lado. */
export type FilaBloquesPdf = IRecuadroPdf[];

export interface IPaginaRuteroPdf {
  /** Líneas del encabezado izquierdo (fechas, ruta, moneda...). */
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

const recuadro = (r: IRecuadroPdf): Content => {
  const header: TableCell[] = r.columnas.map((c) => ({
    text: c.header,
    bold: true,
    fillColor: GRIS_BARRA,
    alignment: c.alignment ?? "left",
  }));
  const body: TableCell[][] = r.filas.map((fila, i) =>
    r.columnas.map((c) => {
      const v = c.valor(fila);
      return {
        text: v == null ? "" : String(v),
        alignment: c.alignment ?? "left",
        fillColor: r.cebra && i % 2 === 0 ? GRIS_FILA : undefined,
      };
    })
  );
  if (!body.length) {
    body.push([
      {
        text: r.vacio ?? "Sin registros.",
        italics: true,
        color: "#666",
        colSpan: r.columnas.length,
      },
      ...r.columnas.slice(1).map((): TableCell => ""),
    ]);
  }
  if (r.total != null) {
    body.push([
      { text: "Total:", bold: true },
      {
        text: r.total,
        bold: true,
        colSpan: Math.max(r.columnas.length - 1, 1),
      },
      ...r.columnas.slice(2).map((): TableCell => ""),
    ]);
  }
  return {
    stack: [
      {
        text: r.titulo.toUpperCase(),
        bold: true,
        alignment: "center",
        characterSpacing: 1,
        margin: [0, 0, 0, 2],
      },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: r.columnas.map((c) => c.width ?? "auto"),
          body: [header, ...body],
        },
        layout: {
          hLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
          vLineWidth: () => 0,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
      },
    ],
    margin: [0, 0, 0, 12],
  };
};

const filaBloques = (fila: FilaBloquesPdf): Content =>
  fila.length === 1
    ? recuadro(fila[0])
    : { columns: fila.map(recuadro), columnGap: 18 };

/** Abre un reporte con el formato de los reportes de Softland FR: encabezado a la izquierda,
 *  Fecha/Hora/Página a la derecha y recuadros con barra gris. `ventana` igual que abrirReportePdf. */
export const abrirReporteRuteroPdf = (
  reporte: IReporteRuteroPdf,
  ventana: Window | null = null
): void => {
  const ahora = new Date();
  const content: Content[] = [];
  reporte.paginas.forEach((pagina, i) => {
    content.push({
      stack: [
        { text: reporte.titulo, fontSize: 14, bold: true },
        ...pagina.encabezado.map((l): Content => ({ text: l, fontSize: 11 })),
      ],
      margin: [0, 0, 150, 12],
      pageBreak: i > 0 ? "before" : undefined,
    });
    pagina.bloques.forEach((f) => content.push(filaBloques(f)));
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: "LETTER",
    pageOrientation: reporte.horizontal === false ? "portrait" : "landscape",
    pageMargins: [30, 30, 30, 30],
    info: { title: reporte.titulo },
    defaultStyle: { font: "Roboto", fontSize: 8 },
    header: (pagina: number, total: number): Content => ({
      table: {
        body: [
          [{ text: "Fecha :", bold: true }, formatDate(ahora, "dd/MM/yyyy", "en-US")],
          [{ text: "Hora :", bold: true }, formatDate(ahora, "h:mm a", "en-US")],
          [{ text: "Página :", bold: true }, `${pagina} de ${total}`],
        ],
      },
      layout: "noBorders",
      fontSize: 9,
      absolutePosition: { x: reporte.horizontal === false ? 470 : 630, y: 26 },
    }),
    content,
  };
  pdfMake.createPdf(docDefinition).open({}, ventana);
};
