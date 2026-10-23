export type TipoDocumentoMonitor =
  | "rutas"
  | "pedidos"
  | "facturas"
  | "devoluciones"
  | "consignaciones"
  | "cobros"
  | "depositos"
  | "garantias"
  | "traspasos";

export interface IFiltroMonitoreo {
  fechaInicio: string;
  fechaFin: string;
  ruta: string;
  handheld: string;
  agente: string;
  top: number;
}

export type IFilaMonitoreo = Record<string, unknown>;

export type FormatoColumna = "texto" | "fecha" | "hora" | "numero" | "monto";

export interface IColumnaMonitor {
  key: string;
  header: string;
  formato?: FormatoColumna;
}

export interface ITabMonitor {
  tipo: TipoDocumentoMonitor;
  titulo: string;
  icono: string;
  columnas: IColumnaMonitor[];
  /** Nota que se muestra sobre la tabla (fuente de los datos o "pendiente backend"). */
  nota?: string;
}

const COL_RUTA: IColumnaMonitor[] = [
  { key: "RUTA", header: "Ruta" },
  { key: "RUTA_DESCRIPCION", header: "Descripción Ruta" },
  { key: "AGENTE", header: "Agente" },
  { key: "AGENTE_NOMBRE", header: "Nombre Agente" },
  { key: "HANDHELD", header: "HandHeld" },
];

const COL_CLIENTE: IColumnaMonitor[] = [
  { key: "CLIENTE", header: "Cliente" },
  { key: "CLIENTE_NOMBRE", header: "Nombre Cliente" },
];

const PENDIENTE =
  "Sin datos — pendiente backend: aún no existe endpoint para este tipo de documento.";

/** Pestañas del monitor (manual FRd pág. 135): Rutas y Pedidos con datos reales, el resto con sus
 *  columnas definidas para cuando el backend exponga cada tipo de documento. */
export const TABS_MONITOR: ITabMonitor[] = [
  {
    tipo: "rutas",
    titulo: "Rutas",
    icono: "directions_car",
    columnas: [
      ...COL_RUTA,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "HORA_INICIO", header: "Hora Inicio", formato: "hora" },
      { key: "HORA_FIN", header: "Hora Fin", formato: "hora" },
      { key: "TOTAL_VISITAS", header: "Visitas", formato: "numero" },
      { key: "CLIENTES_VISITADOS", header: "Clientes", formato: "numero" },
      { key: "VISITAS_CON_GPS", header: "Con GPS", formato: "numero" },
      {
        key: "DURACION_PROMEDIO_MIN",
        header: "Prom. Visita (min)",
        formato: "numero",
      },
    ],
    nota: "Jornada de cada ruta por día: primera y última visita registradas por la handheld.",
  },
  {
    tipo: "pedidos",
    titulo: "Pedidos",
    icono: "shopping_cart",
    columnas: [
      ...COL_RUTA,
      { key: "PEDIDO", header: "Pedido" },
      ...COL_CLIENTE,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "HORA_INICIO", header: "Hora Inicio", formato: "hora" },
      { key: "HORA_FIN", header: "Hora Fin", formato: "hora" },
      { key: "TOTAL", header: "Total", formato: "monto" },
      { key: "RAZON", header: "Razón Visita" },
      { key: "NOTAS", header: "Notas" },
    ],
    nota: "Pedidos enviados por la handheld (alFAC_ENC_PED).",
  },
  {
    tipo: "facturas",
    titulo: "Facturas",
    icono: "receipt_long",
    columnas: [
      ...COL_RUTA,
      { key: "FACTURA", header: "Factura" },
      ...COL_CLIENTE,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "HORA_INICIO", header: "Hora Inicio", formato: "hora" },
      { key: "HORA_FIN", header: "Hora Fin", formato: "hora" },
      { key: "CONDICION_PAGO", header: "Condición Pago" },
      { key: "MONTO", header: "Monto", formato: "monto" },
      { key: "ESTADO", header: "Estado" },
    ],
    nota: PENDIENTE,
  },
  {
    tipo: "devoluciones",
    titulo: "Devoluciones",
    icono: "assignment_return",
    columnas: [
      ...COL_RUTA,
      { key: "DEVOLUCION", header: "Devolución" },
      { key: "FACTURA", header: "Factura" },
      ...COL_CLIENTE,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "MONTO", header: "Monto", formato: "monto" },
      { key: "ESTADO", header: "Estado" },
    ],
    nota: PENDIENTE,
  },
  {
    tipo: "consignaciones",
    titulo: "Consignaciones",
    icono: "inventory_2",
    columnas: [
      ...COL_RUTA,
      { key: "BOLETA", header: "Boleta" },
      ...COL_CLIENTE,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "BODEGA", header: "Bodega" },
      { key: "MONTO", header: "Monto", formato: "monto" },
      { key: "ESTADO", header: "Estado" },
    ],
    nota: PENDIENTE,
  },
  {
    tipo: "cobros",
    titulo: "Cobros",
    icono: "payments",
    columnas: [
      ...COL_RUTA,
      { key: "RECIBO", header: "Recibo" },
      ...COL_CLIENTE,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "TIPO_PAGO", header: "Tipo Pago" },
      { key: "MONTO", header: "Monto", formato: "monto" },
      { key: "ESTADO", header: "Estado" },
    ],
    nota: PENDIENTE,
  },
  {
    tipo: "depositos",
    titulo: "Depósitos",
    icono: "account_balance",
    columnas: [
      ...COL_RUTA,
      { key: "DEPOSITO", header: "Depósito" },
      { key: "BANCO", header: "Banco" },
      { key: "CUENTA", header: "Cuenta" },
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "MONTO", header: "Monto", formato: "monto" },
    ],
    nota: PENDIENTE,
  },
  {
    tipo: "garantias",
    titulo: "Garantías",
    icono: "verified_user",
    columnas: [
      ...COL_RUTA,
      { key: "GARANTIA", header: "Garantía" },
      ...COL_CLIENTE,
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "ARTICULO", header: "Artículo" },
      { key: "CANTIDAD", header: "Cantidad", formato: "numero" },
      { key: "ESTADO", header: "Estado" },
    ],
    nota: PENDIENTE,
  },
  {
    tipo: "traspasos",
    titulo: "Traspasos",
    icono: "swap_horiz",
    columnas: [
      ...COL_RUTA,
      { key: "TRASPASO", header: "Traspaso" },
      { key: "BODEGA_ORIGEN", header: "Bodega Origen" },
      { key: "BODEGA_DESTINO", header: "Bodega Destino" },
      { key: "FECHA", header: "Fecha", formato: "fecha" },
      { key: "LINEAS", header: "Líneas", formato: "numero" },
      { key: "ESTADO", header: "Estado" },
    ],
    nota: PENDIENTE,
  },
];
