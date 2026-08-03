import { createAction, props } from '@ngrx/store';
import { IResquestConsultarArticulo } from '../model/articulo-api-model-interface';
export const loadArticuloAccion = createAction('[Articulo List] Load Articulo');
export const loadedArticuloAccion = createAction(
	'[Articulo List] Load Articulo success',
	props<{ articulo: IResquestConsultarArticulo[] }>()
);
