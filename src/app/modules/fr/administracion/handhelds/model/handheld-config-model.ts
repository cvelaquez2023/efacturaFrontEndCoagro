// Configuración General del Hand Held (pestaña "Configuración General" de Softland FRd).
// Se guarda en erpadmin.CONFIG_HH (fila HANDHELD + CONSTANTE "CONFIG_GENERAL") vía /fr/configHh;
// ver HandheldConfigApiService. La app móvil la descarga con GET /fr/sync/configuracion.
export interface IHandheldConfig {
  // Generales
  simboloMonetario: string;
  nombreArchivoBitacora: string;
  registroMultipleDocumento: "S" | "N";
  cantidadDecimales: number;
  tamanoLetra: number;
  decimalesUnidades: number;

  // Opciones
  limpiarFiltroArticulos: boolean;
  infoDescuentosVencida: boolean;
  seleccionAutomaticaCliente: boolean;
  busquedaAgilCliente: boolean;
  ordenarArticuloCriterio: boolean;
  ordenarArticuloIndice: boolean;
  advertirActualizacion: boolean;

  // Purga de documentos
  purgaAutomatica: boolean;
  purgaManual: boolean;
  purgaDias: number;

  // GPS
  gpsUbicacionVisita: boolean;
  gpsUbicacionCliente: boolean;
  gpsActualizarUbicacionCliente: boolean;
  gpsNoDetenerProceso: boolean;
  gpsDistancia: number;
}

export const HANDHELD_CONFIG_DEFAULT: IHandheldConfig = {
  simboloMonetario: "$",
  nombreArchivoBitacora: "FRmLog.txt",
  registroMultipleDocumento: "S",
  cantidadDecimales: 2,
  tamanoLetra: 9,
  decimalesUnidades: 2,

  limpiarFiltroArticulos: false,
  infoDescuentosVencida: true,
  seleccionAutomaticaCliente: true,
  busquedaAgilCliente: true,
  ordenarArticuloCriterio: false,
  ordenarArticuloIndice: false,
  advertirActualizacion: false,

  purgaAutomatica: false,
  purgaManual: false,
  purgaDias: 1,

  gpsUbicacionVisita: true,
  gpsUbicacionCliente: true,
  gpsActualizarUbicacionCliente: true,
  gpsNoDetenerProceso: true,
  gpsDistancia: 0,
};

export interface IHandheldConfigDialogData {
  handheld: string;
  descripcion: string;
  config: IHandheldConfig;
}
