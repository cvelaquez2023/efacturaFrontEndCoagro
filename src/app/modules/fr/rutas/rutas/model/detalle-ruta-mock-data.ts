import { IF1Item } from '../../shared/f1-selector/f1-selector.component';
import { PaisCompania } from './detalle-ruta-model-interface';

/**
 * Catálogos mock (sin backend aún) compartidos entre el Detalle de Ruta y el formulario de
 * Crear/Editar Ruta para la sección de Consecutivos por Compañía.
 */
export interface ICompaniaF1Item extends IF1Item {
	pais: PaisCompania;
}

export const COMPANIAS_DISPONIBLES: ICompaniaF1Item[] = [
	{ codigo: 'FREEZONE', nombre: 'Freezone Exactus', pais: 'SV' },
	{ codigo: 'COAGRO2', nombre: 'Coagro El Salvador', pais: 'SV' },
	{ codigo: 'DOSV', nombre: 'Distribuidora Dominicana', pais: 'DO' },
	{ codigo: 'GTSA', nombre: 'Guatemala Sociedad Anonima', pais: 'GT' }
];

export const NCF_DISPONIBLES: IF1Item[] = [
	{ codigo: 'B01-00000001', nombre: 'Consumidor Final - Serie B01' },
	{ codigo: 'B02-00000001', nombre: 'Crédito Fiscal - Serie B02' },
	{ codigo: 'B14-00000001', nombre: 'Regímenes Especiales - Serie B14' }
];
