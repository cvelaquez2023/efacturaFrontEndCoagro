/**
 * Cobros (FR → Documentos): recibos de cobro / depósitos que suben las handhelds (solo lectura).
 * Backend: controllers/fr/deposito.js y controllers/fr/reciboPdf.js.
 * Tablas: erpadmin.alCXC_ENC_DEP (recibo), alCXC_DET_DEP (un documento pagado por línea).
 */

/** Recibo (encabezado) de GET /fr/deposito y /fr/deposito/:consecDep. */
export interface IRecibo {
  CONSEC_DEP: number;
  /** Número de recibo (RERT_01_00000). */
  NUM_DEP: string;
  COD_CIA: string;
  COD_BCO: string;
  CTA_BCO: string;
  NOM_CTA: string | null;
  MON_DEP: number;
  /** 'YYYY-MM-DD HH:MM:SS' */
  FEC_DEP: string;
  /** L local, D dólar. */
  IND_MON: string;
  NOTAS: string | null;
  /** S aplicado en el ERP, N pendiente. */
  DOC_PRO: string;
  HANDHELD: string;
  LINEAS: number;
  TOTAL_EFE: number;
  TOTAL_CHE: number;
  TOTAL_DEP: number;
  TOTAL_TRA: number;
  /** Solo en el detalle. */
  lineas?: ILineaRecibo[];
}

/** Documento pagado dentro de un recibo. */
export interface ILineaRecibo {
  NUM_DOC: string;
  COD_TIP_DC: string | null;
  CLASE_DOCUMENTO: string | null;
  COD_CLT: string | null;
  NOM_CLT: string | null;
  /** Ruta del documento. */
  COD_ZON: string | null;
  MON_EFE: number;
  MON_CHE: number;
  MON_DEP: number;
  MON_TRA: number;
  /** Referencia (número de cheque, depósito o transferencia). */
  REF: string | null;
}

/** Fila de GET /fr/deposito/documentos: un documento pagado con los datos de su recibo. */
export interface IDocumentoPagado extends ILineaRecibo {
  CONSEC_DEP: number;
  NUM_DEP: string;
  COD_CIA: string;
  COD_BCO: string;
  CTA_BCO: string;
  NOM_CTA: string | null;
  FEC_DEP: string;
  IND_MON: string;
  DOC_PRO: string;
  HANDHELD: string;
  MONTO_PAGADO: number;
}

/** `totales` de GET /fr/deposito/documentos (de TODO lo filtrado, no solo la página). */
export interface ITotalesCobro {
  TOTAL_EFE: number;
  TOTAL_CHE: number;
  TOTAL_DEP: number;
  TOTAL_TRA: number;
  TOTAL_PAGADO: number;
}

export interface IFiltroCobros {
  desde?: string | null;
  hasta?: string | null;
  handheld?: string | null;
  /** S aplicado / N pendiente. */
  docPro?: string | null;
  /** L / D */
  indMon?: string | null;
  /** Número de recibo o notas (parcial). */
  q?: string | null;
  /** Solo en documentos. */
  numDoc?: string | null;
  cliente?: string | null;
  ruta?: string | null;
}

/** Forma de pago de una línea (la que tiene monto; si hay varias, "Mixto"). */
export const formaDePago = (l: Pick<ILineaRecibo, "MON_EFE" | "MON_CHE" | "MON_DEP" | "MON_TRA">): string => {
  const formas = [
    [l.MON_EFE, "Efectivo"],
    [l.MON_CHE, "Cheque"],
    [l.MON_DEP, "Depósito"],
    [l.MON_TRA, "Transferencia"],
  ].filter(([m]) => Number(m) > 0);
  return formas.length === 1 ? String(formas[0][1]) : formas.length ? "Mixto" : "—";
};
