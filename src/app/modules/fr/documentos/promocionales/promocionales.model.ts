/**
 * Promocionales (FR → Documentos): solicitudes de material promocional que el vendedor registra en la
 * app para un cliente (texto libre + fecha en que lo necesita). En la web se revisan y se marcan como
 * procesadas (o se reabren). Backend: controllers/fr/promocional.js · tabla erpadmin.PROMOCIONALES_RT.
 */
export interface IPromocional {
  ID: number;
  COMPANIA: string | null;
  RUTA: string;
  RUTA_DESCRIPCION: string | null;
  CLIENTE: string;
  NOM_CLT: string | null;
  /** Código de agente de ruteo (AG01…). */
  AGENTE: string | null;
  NOMBRE_AGENTE: string | null;
  HANDHELD: string;
  /** Lo que pide el vendedor (texto libre, máx. 500). */
  NOTAS: string;
  /** YYYY-MM-DD: para cuándo lo necesita. */
  FECHA_REQUERIDA: string;
  /** 'YYYY-MM-DD HH:MM:SS': cuándo lo pidió en la app. */
  FECHA_SOLICITUD: string;
  /** N pendiente / S procesado. */
  DOC_PRO: string;
  FECHA_CREACION: string | null;
  PROCESADO_POR: string | null;
  FECHA_PROCESADO: string | null;
}

export interface IFiltroPromocionales {
  docPro?: string | null;
  ruta?: string | null;
  cliente?: string | null;
  agente?: string | null;
  handheld?: string | null;
  /** Sobre FECHA_REQUERIDA, inclusive. */
  desde?: string | null;
  hasta?: string | null;
  /** Código o nombre del cliente, o texto de la solicitud (parcial). */
  q?: string | null;
}

/** Urgencia de una solicitud pendiente según su fecha requerida. */
export type Urgencia = "VENCIDA" | "HOY" | "PRONTO" | "A_TIEMPO" | "PROCESADA";
