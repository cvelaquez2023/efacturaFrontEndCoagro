/**
 * Hoja de estilos de los informes en Excel de Metas, copiada del libro de COAGRO
 * "2026-10_Meta-Incentivo_Baudilio-1.xlsx": Arial, azul marino 1B2A5C, verde 3AAA35, amarillo de
 * semanas FFF2B3, gris de filas alternas F4F5F7, verde claro EEF7EA, bordes D9DCE1.
 * Usar los índices de E en ICeldaRica.s; los dxf (D) son para el formato condicional.
 */

/** Índices de estilo (cellXfs). Los "_ALT" son la variante de fila alterna (fondo gris). */
export const E = {
  NORMAL: 0,
  TITULO: 1, // negrita 18 azul marino
  ETIQUETA_GRIS: 2, // 9 gris, derecha
  PCT_AZUL: 3, // negrita 11 azul, 0%
  RESUMEN_TITULO: 4, // negrita 9 gris
  RES_ETIQUETA: 5, // 11 azul marino, fondo gris, borde
  RES_ETIQUETA_VERDE: 6, // fondo verde claro
  RES_ENTERO: 7, // negrita 12, #,##0, fondo gris
  RES_PCT: 8, // 0.0%
  RES_MONEDA: 9, // $#,##0.00
  RES_MONEDA_VERDE: 10, // $#,##0.00 fondo verde claro
  ENC: 11, // encabezado: blanco negrita sobre azul marino, centrado, ajustar texto
  ENC_SEMANA: 12, // encabezado verde
  TEXTO: 13,
  TEXTO_ALT: 14,
  CODIGO: 15, // formato texto (@)
  CODIGO_ALT: 16,
  INCENTIVO: 17, // $0.000 verde
  INCENTIVO_ALT: 18,
  META: 19, // #,##0 azul
  META_ALT: 20,
  ENTERO_NEGRITA: 21, // #,##0 negrita azul marino
  ENTERO_NEGRITA_ALT: 22,
  SEMANA: 23, // amarillo, #,##0 (cero = vacío)
  PCT: 24, // 0%
  PCT_ALT: 25,
  FALTAN: 26, // #,##0 y ✓ cuando es 0
  FALTAN_ALT: 27,
  MONEDA_NEGRITA: 28,
  MONEDA_NEGRITA_ALT: 29,
  MONEDA: 30,
  MONEDA_ALT: 31,
  TOTAL_TEXTO: 32, // fila TOTAL azul marino
  TOTAL_ENTERO: 33,
  TOTAL_PCT: 34,
  TOTAL_MONEDA: 35,
  NOTA_TITULO: 36, // negrita 10 azul marino
  NOTA: 37, // cursiva gris, ajustar texto
  ENTERO: 38, // #,##0 normal
  ENTERO_ALT: 39,
  TOTAL_VACIO: 40, // celda azul sin valor
} as const;

/** Formatos condicionales (dxf). */
export const D = {
  GRIS: 0, // "Aún no paga"
  YA_PAGA: 1, // negrita azul marino sobre verde claro
  CUMPLIDA: 2, // negrita verde oscuro sobre verde
} as const;

const borde = 1; // borde fino gris claro
const alinear = (h: string, extra = "") => `<alignment horizontal="${h}" vertical="center"${extra}/>`;
const xf = (numFmt: number, font: number, fill: number, b: number, alineacion = "") =>
  `<xf numFmtId="${numFmt}" fontId="${font}" fillId="${fill}" borderId="${b}" xfId="0"` +
  `${numFmt ? ' applyNumberFormat="1"' : ""}${font ? ' applyFont="1"' : ""}${fill ? ' applyFill="1"' : ""}${b ? ' applyBorder="1"' : ""}` +
  (alineacion ? ` applyAlignment="1">${alineacion}</xf>` : "/>");

// Fuentes
const F = {
  BASE: 0, // Arial 10
  TITULO: 1,
  GRIS9: 2,
  AZUL_B11: 3,
  GRIS9_B: 4,
  MARINO11: 5,
  MARINO_B12: 6,
  MARINO10: 7,
  BLANCO_B10: 8,
  AZUL10: 9,
  MARINO_B10: 10,
  VERDE10: 11,
  GRIS_I10: 12,
};
// Rellenos (0 y 1 son los obligatorios de Excel)
const R = { NADA: 0, GRIS: 2, VERDE_CLARO: 3, MARINO: 4, VERDE: 5, AMARILLO: 6 };

/** styles.xml completo. */
export const ESTILOS_INFORME_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
  `<numFmts count="5">` +
  `<numFmt numFmtId="164" formatCode="0.0%"/>` +
  `<numFmt numFmtId="165" formatCode="&quot;$&quot;#,##0.00"/>` +
  `<numFmt numFmtId="166" formatCode="&quot;$&quot;0.000"/>` +
  `<numFmt numFmtId="167" formatCode="#,##0;\\-#,##0;;@"/>` +
  `<numFmt numFmtId="168" formatCode="#,##0;\\-#,##0;&quot;✓&quot;"/>` +
  `</numFmts>` +
  `<fonts count="13">` +
  `<font><sz val="10"/><name val="Arial"/><family val="2"/></font>` +
  `<font><b/><sz val="18"/><color rgb="FF1B2A5C"/><name val="Arial"/><family val="2"/></font>` +
  `<font><sz val="9"/><color rgb="FF6B7280"/><name val="Arial"/><family val="2"/></font>` +
  `<font><b/><sz val="11"/><color rgb="FF0000FF"/><name val="Arial"/><family val="2"/></font>` +
  `<font><b/><sz val="9"/><color rgb="FF6B7280"/><name val="Arial"/><family val="2"/></font>` +
  `<font><sz val="11"/><color rgb="FF1B2A5C"/><name val="Arial"/><family val="2"/></font>` +
  `<font><b/><sz val="12"/><color rgb="FF1B2A5C"/><name val="Arial"/><family val="2"/></font>` +
  `<font><sz val="10"/><color rgb="FF1B2A5C"/><name val="Arial"/><family val="2"/></font>` +
  `<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/><family val="2"/></font>` +
  `<font><sz val="10"/><color rgb="FF0000FF"/><name val="Arial"/><family val="2"/></font>` +
  `<font><b/><sz val="10"/><color rgb="FF1B2A5C"/><name val="Arial"/><family val="2"/></font>` +
  `<font><sz val="10"/><color rgb="FF008000"/><name val="Arial"/><family val="2"/></font>` +
  `<font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Arial"/><family val="2"/></font>` +
  `</fonts>` +
  `<fills count="7">` +
  `<fill><patternFill patternType="none"/></fill>` +
  `<fill><patternFill patternType="gray125"/></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFF4F5F7"/><bgColor indexed="64"/></patternFill></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFEEF7EA"/><bgColor indexed="64"/></patternFill></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FF1B2A5C"/><bgColor indexed="64"/></patternFill></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FF3AAA35"/><bgColor indexed="64"/></patternFill></fill>` +
  `<fill><patternFill patternType="solid"><fgColor rgb="FFFFF2B3"/><bgColor indexed="64"/></patternFill></fill>` +
  `</fills>` +
  `<borders count="2">` +
  `<border><left/><right/><top/><bottom/><diagonal/></border>` +
  `<border><left style="thin"><color rgb="FFD9DCE1"/></left><right style="thin"><color rgb="FFD9DCE1"/></right>` +
  `<top style="thin"><color rgb="FFD9DCE1"/></top><bottom style="thin"><color rgb="FFD9DCE1"/></bottom><diagonal/></border>` +
  `</borders>` +
  `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
  `<cellXfs count="41">` +
  xf(0, F.BASE, R.NADA, 0) + // 0 NORMAL
  xf(0, F.TITULO, R.NADA, 0, alinear("left")) + // 1 TITULO
  xf(0, F.GRIS9, R.NADA, 0, alinear("right")) + // 2 ETIQUETA_GRIS
  xf(9, F.AZUL_B11, R.NADA, 0, alinear("left")) + // 3 PCT_AZUL
  xf(0, F.GRIS9_B, R.NADA, 0) + // 4 RESUMEN_TITULO
  xf(0, F.MARINO11, R.GRIS, borde, alinear("left")) + // 5 RES_ETIQUETA
  xf(0, F.MARINO11, R.VERDE_CLARO, borde, alinear("left")) + // 6 RES_ETIQUETA_VERDE
  xf(3, F.MARINO_B12, R.GRIS, borde, alinear("right")) + // 7 RES_ENTERO
  xf(164, F.MARINO_B12, R.GRIS, borde, alinear("right")) + // 8 RES_PCT
  xf(165, F.MARINO_B12, R.GRIS, borde, alinear("right")) + // 9 RES_MONEDA
  xf(165, F.MARINO_B12, R.VERDE_CLARO, borde, alinear("right")) + // 10 RES_MONEDA_VERDE
  xf(0, F.BLANCO_B10, R.MARINO, borde, alinear("center", ' wrapText="1"')) + // 11 ENC
  xf(0, F.BLANCO_B10, R.VERDE, borde, alinear("center", ' wrapText="1"')) + // 12 ENC_SEMANA
  xf(0, F.MARINO10, R.NADA, borde, alinear("left")) + // 13 TEXTO
  xf(0, F.MARINO10, R.GRIS, borde, alinear("left")) + // 14 TEXTO_ALT
  xf(49, F.MARINO10, R.NADA, borde, alinear("left")) + // 15 CODIGO
  xf(49, F.MARINO10, R.GRIS, borde, alinear("left")) + // 16 CODIGO_ALT
  xf(166, F.VERDE10, R.NADA, borde, alinear("right")) + // 17 INCENTIVO
  xf(166, F.VERDE10, R.GRIS, borde, alinear("right")) + // 18 INCENTIVO_ALT
  xf(3, F.AZUL10, R.NADA, borde, alinear("right")) + // 19 META
  xf(3, F.AZUL10, R.GRIS, borde, alinear("right")) + // 20 META_ALT
  xf(3, F.MARINO_B10, R.NADA, borde, alinear("right")) + // 21 ENTERO_NEGRITA
  xf(3, F.MARINO_B10, R.GRIS, borde, alinear("right")) + // 22 ENTERO_NEGRITA_ALT
  xf(167, F.MARINO10, R.AMARILLO, borde, alinear("right")) + // 23 SEMANA
  xf(9, F.MARINO10, R.NADA, borde, alinear("right")) + // 24 PCT
  xf(9, F.MARINO10, R.GRIS, borde, alinear("right")) + // 25 PCT_ALT
  xf(168, F.MARINO10, R.NADA, borde, alinear("right")) + // 26 FALTAN
  xf(168, F.MARINO10, R.GRIS, borde, alinear("right")) + // 27 FALTAN_ALT
  xf(165, F.MARINO_B10, R.NADA, borde, alinear("right")) + // 28 MONEDA_NEGRITA
  xf(165, F.MARINO_B10, R.GRIS, borde, alinear("right")) + // 29 MONEDA_NEGRITA_ALT
  xf(165, F.MARINO10, R.NADA, borde, alinear("right")) + // 30 MONEDA
  xf(165, F.MARINO10, R.GRIS, borde, alinear("right")) + // 31 MONEDA_ALT
  xf(0, F.BLANCO_B10, R.MARINO, borde, alinear("left")) + // 32 TOTAL_TEXTO
  xf(3, F.BLANCO_B10, R.MARINO, borde, alinear("right")) + // 33 TOTAL_ENTERO
  xf(9, F.BLANCO_B10, R.MARINO, borde, alinear("right")) + // 34 TOTAL_PCT
  xf(165, F.BLANCO_B10, R.MARINO, borde, alinear("right")) + // 35 TOTAL_MONEDA
  xf(0, F.MARINO_B10, R.NADA, 0) + // 36 NOTA_TITULO
  xf(0, F.GRIS_I10, R.NADA, 0, alinear("left", ' wrapText="1"')) + // 37 NOTA
  xf(3, F.MARINO10, R.NADA, borde, alinear("right")) + // 38 ENTERO
  xf(3, F.MARINO10, R.GRIS, borde, alinear("right")) + // 39 ENTERO_ALT
  xf(0, F.BLANCO_B10, R.MARINO, borde) + // 40 TOTAL_VACIO
  `</cellXfs>` +
  `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
  `<dxfs count="3">` +
  `<dxf><font><color rgb="FF6B7280"/></font></dxf>` +
  `<dxf><font><b/><color rgb="FF1B2A5C"/></font><fill><patternFill><bgColor rgb="FFEEF7EA"/></patternFill></fill></dxf>` +
  `<dxf><font><b/><color rgb="FF1E6B3A"/></font><fill><patternFill><bgColor rgb="FFC8E6D2"/></patternFill></fill></dxf>` +
  `</dxfs>` +
  `<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>` +
  `</styleSheet>`;

/** Barra de datos (avance 0..100 %) como la del libro de COAGRO. */
export const cfBarraAvance = (rango: string, prioridad = 4): string =>
  `<conditionalFormatting sqref="${rango}"><cfRule type="dataBar" priority="${prioridad}"><dataBar>` +
  `<cfvo type="num" val="0"/><cfvo type="num" val="1"/><color rgb="FF2FA39A"/></dataBar></cfRule></conditionalFormatting>`;

/** Colores del Estado ("Meta cumplida" / "Ya paga" / "Aún no paga"). */
export const cfEstado = (rango: string): string =>
  `<conditionalFormatting sqref="${rango}">` +
  `<cfRule type="cellIs" dxfId="${D.CUMPLIDA}" priority="1" operator="equal"><formula>"Meta cumplida"</formula></cfRule>` +
  `<cfRule type="cellIs" dxfId="${D.YA_PAGA}" priority="2" operator="equal"><formula>"Ya paga"</formula></cfRule>` +
  `<cfRule type="cellIs" dxfId="${D.GRIS}" priority="3" operator="equal"><formula>"Aún no paga"</formula></cfRule>` +
  `</conditionalFormatting>`;
