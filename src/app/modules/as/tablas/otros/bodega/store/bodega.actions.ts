import { createAction, props } from '@ngrx/store';
import { IResponseBodega } from '../model/bodega.interface';

export const loadBodegaAccion = createAction('[Bodega List] Load Bodega');
export const loadedBodegaAccion = createAction(
	'[Bodega List] Load Bodega success',
	props<{ bodega: IResponseBodega[] }>()
);
