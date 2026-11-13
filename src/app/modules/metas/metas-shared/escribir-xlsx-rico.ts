/**
 * Generador de Excel .xlsx "con formato" (sin dependencias), para informes que deben verse como los
 * libros de COAGRO: estilo por celda, fórmulas (con su valor calculado), celdas combinadas, paneles
 * inmovilizados, autofiltro, formato condicional, alto de filas, sin cuadrícula y ajuste a página.
 * Reutiliza el ZIP y los helpers de escribir-xlsx.ts.
 */
import { esc, letraColumna, nombreHojaValido, zipStore } from "./escribir-xlsx";

/** Celda con formato: valor (o resultado de la fórmula), fórmula opcional y estilo (índice de cellXfs). */
export interface ICeldaRica {
  v?: string | number | null;
  /** Fórmula en inglés, sin "=" (p. ej. "SUM(E14:E20)"). */
  f?: string;
  /** Índice del estilo en la hoja de estilos que se pase a crearXlsxRico. */
  s?: number;
}

export interface IHojaRica {
  nombre: string;
  /** filas[i][j] = celda de la fila i+1, columna j (null/undefined = vacía). */
  filas: (ICeldaRica | null | undefined)[][];
  /** Ancho por columna (caracteres). */
  anchos?: number[];
  /** Alto por número de fila (1 = primera). */
  altos?: Record<number, number>;
  /** Rangos combinados, p. ej. ["A5:B5"]. */
  combinar?: string[];
  /** Inmovilizar: columnas a la izquierda y filas arriba. */
  fijar?: { columnas: number; filas: number };
  /** Rango del autofiltro, p. ej. "A13:Q87". */
  autoFiltro?: string;
  /** XML de <conditionalFormatting> ya armado (usa los dxf de la hoja de estilos). */
  formatoCondicionalXml?: string;
  /** Sin líneas de cuadrícula (como los informes de COAGRO). */
  sinCuadricula?: boolean;
  /** Ajustar al ancho de una página, horizontal. */
  ajustarPagina?: boolean;
  /** Filas que se repiten al imprimir, p. ej. "$13:$13". */
  filasTituloImpresion?: string;
}

/** Arma el .xlsx con la hoja de estilos indicada (XML completo de styles.xml). */
export const crearXlsxRico = (hojas: IHojaRica[], estilosXml: string): Blob => {
  const textos: string[] = [];
  const posicion = new Map<string, number>();
  let totalTextos = 0;
  const indiceTexto = (t: string): number => {
    totalTextos++;
    let i = posicion.get(t);
    if (i === undefined) {
      i = textos.length;
      textos.push(t);
      posicion.set(t, i);
    }
    return i;
  };

  const xmlHoja = (h: IHojaRica, indiceHoja: number): string => {
    const filasXml = h.filas
      .map((fila, r) => {
        const celdas = (fila ?? [])
          .map((c, col) => {
            if (!c) return "";
            const ref = `${letraColumna(col)}${r + 1}`;
            const s = c.s !== undefined ? ` s="${c.s}"` : "";
            if (c.f) {
              const formula = `<f>${esc(c.f)}</f>`;
              if (typeof c.v === "number" && Number.isFinite(c.v)) return `<c r="${ref}"${s}>${formula}<v>${c.v}</v></c>`;
              if (typeof c.v === "string") return `<c r="${ref}"${s} t="str">${formula}<v>${esc(c.v)}</v></c>`;
              return `<c r="${ref}"${s}>${formula}</c>`;
            }
            if (c.v === null || c.v === undefined || c.v === "") return `<c r="${ref}"${s}/>`;
            if (typeof c.v === "number" && Number.isFinite(c.v)) return `<c r="${ref}"${s}><v>${c.v}</v></c>`;
            return `<c r="${ref}"${s} t="s"><v>${indiceTexto(String(c.v))}</v></c>`;
          })
          .join("");
        const alto = h.altos?.[r + 1];
        return `<row r="${r + 1}"${alto ? ` ht="${alto}" customHeight="1"` : ""}>${celdas}</row>`;
      })
      .join("");
    const columnas = Math.max(...h.filas.map((f) => (f ?? []).length), 1);
    const ultima = `${letraColumna(columnas - 1)}${Math.max(h.filas.length, 1)}`;
    const cols = (h.anchos ?? []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("");
    const panel = h.fijar
      ? `<pane${h.fijar.columnas ? ` xSplit="${h.fijar.columnas}"` : ""}${h.fijar.filas ? ` ySplit="${h.fijar.filas}"` : ""} topLeftCell="${letraColumna(h.fijar.columnas)}${h.fijar.filas + 1}" activePane="${h.fijar.columnas && h.fijar.filas ? "bottomRight" : h.fijar.filas ? "bottomLeft" : "topRight"}" state="frozen"/>`
      : "";
    return (
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
      (h.ajustarPagina ? `<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>` : "") +
      `<dimension ref="A1:${ultima}"/>` +
      `<sheetViews><sheetView${h.sinCuadricula ? ` showGridLines="0"` : ""}${indiceHoja === 0 ? ` tabSelected="1"` : ""} workbookViewId="0">${panel}</sheetView></sheetViews>` +
      `<sheetFormatPr defaultRowHeight="15"/>` +
      (cols ? `<cols>${cols}</cols>` : "") +
      `<sheetData>${filasXml}</sheetData>` +
      (h.autoFiltro ? `<autoFilter ref="${h.autoFiltro}"/>` : "") +
      (h.combinar?.length ? `<mergeCells count="${h.combinar.length}">${h.combinar.map((m) => `<mergeCell ref="${m}"/>`).join("")}</mergeCells>` : "") +
      (h.formatoCondicionalXml ?? "") +
      `<pageMargins left="0.5" right="0.5" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>` +
      (h.ajustarPagina ? `<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>` : "") +
      `</worksheet>`
    );
  };

  const xmlHojas = hojas.map((h, i) => xmlHoja(h, i));
  const n = hojas.length;
  // Nombres definidos: autofiltro y títulos de impresión (como los guarda Excel).
  const definidos = hojas
    .map((h, i) => {
      const hoja = `'${nombreHojaValido(h.nombre).replace(/'/g, "''")}'`;
      const partes: string[] = [];
      if (h.autoFiltro) {
        const [a, b] = h.autoFiltro.split(":");
        const abs = (ref: string) => ref.replace(/^([A-Z]+)(\d+)$/, "$$$1$$$2");
        partes.push(`<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">${esc(`${hoja}!${abs(a)}:${abs(b)}`)}</definedName>`);
      }
      if (h.filasTituloImpresion) {
        partes.push(`<definedName name="_xlnm.Print_Titles" localSheetId="${i}">${esc(`${hoja}!${h.filasTituloImpresion}`)}</definedName>`);
      }
      return partes.join("");
    })
    .join("");

  const compartidos =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${Math.max(totalTextos, textos.length)}" uniqueCount="${textos.length}">` +
    textos.map((t) => `<si><t xml:space="preserve">${esc(t)}</t></si>`).join("") +
    `</sst>`;

  const archivos = [
    {
      nombre: "[Content_Types].xml",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        hojas
          .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
          .join("") +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
        `<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>` +
        `</Types>`,
    },
    {
      nombre: "_rels/.rels",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
        `</Relationships>`,
    },
    {
      nombre: "xl/workbook.xml",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
        `<bookViews><workbookView activeTab="0"/></bookViews><sheets>` +
        hojas.map((h, i) => `<sheet name="${esc(nombreHojaValido(h.nombre))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") +
        `</sheets>` +
        (definidos ? `<definedNames>${definidos}</definedNames>` : "") +
        // Recalcular al abrir: los valores calculados aquí son correctos, pero así Excel queda al día.
        `<calcPr calcId="191029" fullCalcOnLoad="1"/>` +
        `</workbook>`,
    },
    {
      nombre: "xl/_rels/workbook.xml.rels",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        hojas
          .map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
          .join("") +
        `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `<Relationship Id="rId${n + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>` +
        `</Relationships>`,
    },
    { nombre: "xl/styles.xml", texto: estilosXml },
    { nombre: "xl/sharedStrings.xml", texto: compartidos },
    ...xmlHojas.map((texto, i) => ({ nombre: `xl/worksheets/sheet${i + 1}.xml`, texto })),
  ];
  return new Blob([zipStore(archivos)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
};
