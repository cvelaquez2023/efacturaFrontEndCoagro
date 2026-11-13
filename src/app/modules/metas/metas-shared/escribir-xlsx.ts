/**
 * Generador mínimo de Excel .xlsx sin dependencias (para descargar plantillas).
 *
 * Arma el ZIP (sin compresión, método "store") con el XML mínimo de SpreadsheetML: libro, hojas,
 * estilos (encabezado en negrita con fondo), textos compartidos (sharedStrings, el formato que usa el
 * propio Excel y que leen todas las librerías, p. ej. exceljs del backend) y relaciones. Los códigos
 * como "001" van como texto, así Excel no les quita los ceros.
 */

export type CeldaXlsx = string | number | null | undefined;

export interface IHojaXlsx {
  nombre: string;
  filas: CeldaXlsx[][];
  /** Ancho de cada columna (en caracteres aprox.). */
  anchos?: number[];
  /** Columnas (base 0) que deben guardarse SIEMPRE como texto aunque parezcan número (códigos). */
  columnasTexto?: number[];
}

// ------------------------------------------------------------------ ZIP (store) + CRC32

const TABLA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (datos: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < datos.length; i++) c = TABLA_CRC[(c ^ datos[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

export const zipStore = (archivos: { nombre: string; texto: string }[]): Uint8Array => {
  const cod = new TextEncoder();
  const partes: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const a of archivos) {
    const nombre = cod.encode(a.nombre);
    const datos = cod.encode(a.texto);
    const crc = crc32(datos);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // versión
    local.setUint16(6, 0x0800, true); // nombres en UTF-8
    local.setUint16(8, 0, true); // store
    local.setUint16(10, 0, true);
    local.setUint16(12, 0x21, true); // fecha 1980-01-01
    local.setUint32(14, crc, true);
    local.setUint32(18, datos.length, true);
    local.setUint32(22, datos.length, true);
    local.setUint16(26, nombre.length, true);
    local.setUint16(28, 0, true);
    partes.push(new Uint8Array(local.buffer), nombre, datos);

    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0x0800, true);
    dir.setUint16(10, 0, true);
    dir.setUint16(12, 0, true);
    dir.setUint16(14, 0x21, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, datos.length, true);
    dir.setUint32(24, datos.length, true);
    dir.setUint16(28, nombre.length, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer), nombre);

    offset += 30 + nombre.length + datos.length;
  }
  const tamCentral = central.reduce((t, p) => t + p.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamCentral, true);
  fin.setUint32(16, offset, true);

  const todo = [...partes, ...central, new Uint8Array(fin.buffer)];
  const salida = new Uint8Array(todo.reduce((t, p) => t + p.length, 0));
  let p = 0;
  for (const parte of todo) {
    salida.set(parte, p);
    p += parte.length;
  }
  return salida;
};

// ------------------------------------------------------------------ SpreadsheetML

export const esc = (t: string): string =>
  t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // caracteres de control no válidos en XML
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

export const letraColumna = (i: number): string => {
  let n = i + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export const nombreHojaValido = (n: string): string => n.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Hoja";

const xmlHoja = (h: IHojaXlsx, indiceTexto: (t: string) => number): string => {
  const texto = new Set(h.columnasTexto ?? []);
  const columnas = Math.max(...h.filas.map((f) => f.length), 1);
  // Ancho de cada columna; las de códigos llevan formato Texto en TODA la columna, así lo que el
  // usuario escriba después ("001") no pierde los ceros.
  const totalCols = Math.max(h.anchos?.length ?? 0, ...(h.columnasTexto ?? []).map((c) => c + 1), 0);
  const cols = Array.from({ length: totalCols }, (_, i) => {
    const ancho = h.anchos?.[i] ?? 10;
    const estilo = texto.has(i) ? " style=\"2\"" : "";
    return `<col min="${i + 1}" max="${i + 1}" width="${ancho}"${estilo} customWidth="1"/>`;
  }).join("");
  const filas = h.filas
    .map((fila, r) => {
      const celdas = fila
        .map((v, c) => {
          if (v === null || v === undefined || v === "") return "";
          const ref = `${letraColumna(c)}${r + 1}`;
          const estilo = r === 0 ? ' s="1"' : texto.has(c) ? ' s="2"' : "";
          if (typeof v === "number" && Number.isFinite(v) && !texto.has(c) && r > 0) {
            return `<c r="${ref}"${estilo}><v>${v}</v></c>`;
          }
          return `<c r="${ref}"${estilo} t="s"><v>${indiceTexto(String(v))}</v></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${celdas}</row>`;
    })
    .join("");
  const ultima = `${letraColumna(columnas - 1)}${Math.max(h.filas.length, 1)}`;
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<dimension ref="A1:${ultima}"/>` +
    // encabezado fijo al bajar
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="15"/>` +
    (cols ? `<cols>${cols}</cols>` : "") +
    `<sheetData>${filas}</sheetData>` +
    `</worksheet>`
  );
};

const ESTILOS =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +

  `<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font>` +
  `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font></fonts>` +
  `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFC62828"/><bgColor indexed="64"/></patternFill></fill></fills>` +
  `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="3">` +
  `<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
  `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>` +
  `<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>` +
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `</styleSheet>`;

/** Arma el .xlsx (la primera hoja queda activa al abrir) y devuelve el Blob. */
export const crearXlsx = (hojas: IHojaXlsx[]): Blob => {
  const n = hojas.length;
  // Tabla de textos compartidos (cada texto distinto una sola vez).
  const textos: string[] = [];
  const posicion = new Map<string, number>();
  const indiceTexto = (t: string): number => {
    let i = posicion.get(t);
    if (i === undefined) {
      i = textos.length;
      textos.push(t);
      posicion.set(t, i);
    }
    return i;
  };
  const xmlHojas = hojas.map((h) => xmlHoja(h, indiceTexto));
  let totalTextos = 0;
  hojas.forEach((h) => h.filas.forEach((fila) => fila.forEach((v) => {
    if (v !== null && v !== undefined && v !== "" && !(typeof v === "number" && Number.isFinite(v))) totalTextos++;
  })));
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
          .map(
            (_, i) =>
              `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
          )
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
        `</sheets></workbook>`,
    },
    {
      nombre: "xl/_rels/workbook.xml.rels",
      texto:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        hojas
          .map(
            (_, i) =>
              `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
          )
          .join("") +
        `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
        `<Relationship Id="rId${n + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>` +
        `</Relationships>`,
    },
    { nombre: "xl/styles.xml", texto: ESTILOS },
    { nombre: "xl/sharedStrings.xml", texto: compartidos },
    ...xmlHojas.map((texto, i) => ({ nombre: `xl/worksheets/sheet${i + 1}.xml`, texto })),
  ];
  return new Blob([zipStore(archivos)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

/** Descarga un Blob con el nombre indicado. */
export const descargarBlob = (blob: Blob, nombre: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
