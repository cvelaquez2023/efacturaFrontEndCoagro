import { createAction, props } from '@ngrx/store';
import { IResponseLocaizacionBodega } from '../../model/bodega.interface';

export const loadLocalizacionAccion = createAction('[Localizacion List] Load Localizacion');
export const loadedLocalizacionAccion = createAction(
	'[Localizacion List] Load Localizacion success',
	props<{ localizacion: IResponseLocaizacionBodega[] }>()
);
