export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miercoles"
  | "Jueves"
  | "Viernes"
  | "Sabado"
  | "Domingo";

export const DIAS_SEMANA: DiaSemana[] = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

/** Letra de atajo de teclado por día (manual FRd: Ctrl+Shift+DIA / Ctrl+Alt+DIA -> L,K,M,J,V,S,D). */
export const LETRA_DIA: Record<DiaSemana, string> = {
  Lunes: "L",
  Martes: "K",
  Miercoles: "M",
  Jueves: "J",
  Viernes: "V",
  Sabado: "S",
  Domingo: "D",
};

export interface IAsignacionRutaFr {
  ruta: string;
  descripcion: string;
  compania: string;
  companiaNombre?: string;
  activa: boolean;
  grupoArticulo: string;
  grupoArticuloNombre?: string;
  agente: string;
  agenteNombre?: string;
  handheld: string;
  handheldNombre?: string;
  bodega: string;
  bodegaNombre?: string;
  /** Clientes distintos asignados a la ruta en rutaCliente (solo lectura, para el listado). */
  cantidadClientes?: number;
}

/** Estado de asignación de un cliente a través de TODAS las rutas (no solo la actual). */
export type EstadoAsignacionCliente =
  | "NO_ASIGNADO"
  | "EN_OTRAS_RUTAS"
  | "RUTA_ACTUAL_Y_OTRAS"
  | "EN_RUTA_ACTUAL";

export interface IClienteRuta {
  cliente: string;
  nombre: string;
  dia: DiaSemana | "";
  orden: number;
}

/** Cabecera de Asignación de Ruta, respaldada por RUTA_ASIGNADA_RT (relación 1:1, PK = RUTA). */
export interface ICreateRutaAsignadaModel {
  ruta: string;
  agente: string;
  handheld: string;
  grupoArticulo: string;
  bodega: string;
  compania: string;
  activa: "S" | "N";
}

export interface IResponseRutaAsignada {
  RUTA: string;
  AGENTE: string;
  HANDHELD: string;
  GRUPO_ARTICULO: string;
  BODEGA: string;
  COMPANIA: string | null;
  ACTIVA: string;
}

/** Dia de la semana como lo espera /fr/rutaCliente: 1=Lunes ... 7=Domingo. */
export const DIA_NUMERO: Record<DiaSemana, number> = {
  Lunes: 1,
  Martes: 2,
  Miercoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sabado: 6,
  Domingo: 7,
};

export const NUMERO_DIA: Record<number, DiaSemana> = {
  1: "Lunes",
  2: "Martes",
  3: "Miercoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sabado",
  7: "Domingo",
};

/** Fila real de RUTA_CLIENTE (PK compuesta RUTA+CLIENTE+DIA). Un cliente solo puede tener un
 *  dia asignado por ruta; el backend rechaza cualquier otro intento para la misma ruta. */
export interface IResponseRutaCliente {
  RUTA: string;
  CLIENTE: string;
  DIA: number;
  ORDEN: number;
}

export interface ICreateRutaClienteModel {
  ruta: string;
  cliente: string;
  dia: number;
  orden: number;
}
