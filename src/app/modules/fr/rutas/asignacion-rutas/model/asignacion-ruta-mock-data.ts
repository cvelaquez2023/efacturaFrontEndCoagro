import { IF1Item } from "../../shared/f1-selector/f1-selector.component";

/**
 * Catálogo mock (sin backend aún) usado por el picker F1 de Compañía en Asignación de Rutas.
 * Camión/Bodega y Agente ya usan catálogos reales (BodegaAsocRtApiService, VendedorErpApiService).
 */
export const COMPANIAS_DISPONIBLES: IF1Item[] = [
  { codigo: "FREEZONE", nombre: "Freezone Exactus" },
  { codigo: "COAGRO2", nombre: "Coagro El Salvador" },
  { codigo: "DOSV", nombre: "Distribuidora Dominicana" },
  { codigo: "GTSA", nombre: "Guatemala Sociedad Anonima" },
];
