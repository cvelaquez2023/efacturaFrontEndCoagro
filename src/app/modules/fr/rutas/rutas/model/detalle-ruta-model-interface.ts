/**
 * Tabla de consecutivos por compañía del detalle de una Ruta (manual FRd, sección RUTAS - DETALLE).
 * No existe endpoint de backend para esto todavía: se maneja en memoria (mock) dentro del diálogo.
 */
export type PaisCompania = "SV" | "DO" | "GT";

export interface ICompaniaConsecutivoRuta {
  compania: string;
  companiaNombre: string;
  pais: PaisCompania;
  devolucion: string;
  pedido: string;
  pedidoConDescuento: string;
  factura: string;
  inventario: string;
  reciboCobro: string;
  notaCredito: string;
  ncfConsumidorFinal: string;
  ncfCreditoFiscal: string;
  resolucionFactura: string;
  resolucionDevolucion: string;
}

/**
 * Cabecera de "Ruta Asignada" / "Asignación de Agente" que se muestra en el Detalle de la Ruta
 * (manual FRd, secciones RUTAS y ASIGNACIÓN DE RUTAS combinadas a pedido del usuario). Grupo
 * Artículo y HandHeld son F1 reales; Agente y Camión/Bodega son F1 mock (sin backend de FR aún).
 */
export interface IRutaCabeceraAsignacion {
  grupoArticulo: string;
  grupoArticuloNombre: string;
  agente: string;
  agenteNombre: string;
  handheld: string;
  handheldNombre: string;
  bodega: string;
  bodegaNombre: string;
}
