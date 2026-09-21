import { IF1Item } from '../../shared/f1-selector/f1-selector.component';

/**
 * Catálogos mock (sin backend aún) usados por los pickers F1 de Compañía y Agente en Asignación
 * de Rutas. Camión/Bodega ya usa el catálogo real (BodegaAsocRtApiService).
 */
export const COMPANIAS_DISPONIBLES: IF1Item[] = [
	{ codigo: 'FREEZONE', nombre: 'Freezone Exactus' },
	{ codigo: 'COAGRO2', nombre: 'Coagro El Salvador' },
	{ codigo: 'DOSV', nombre: 'Distribuidora Dominicana' },
	{ codigo: 'GTSA', nombre: 'Guatemala Sociedad Anonima' }
];

export const AGENTES_DISPONIBLES: IF1Item[] = [
	{ codigo: 'AG01', nombre: 'Vendedor 1' },
	{ codigo: 'AG02', nombre: 'Vendedor 2' },
	{ codigo: 'AG03', nombre: 'Vendedor 3' },
	{ codigo: 'AG04', nombre: 'Vendedor 4' }
];
