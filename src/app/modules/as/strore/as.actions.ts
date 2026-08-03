import { Iglobales_AS } from './../model/Globales_AS.interface';
import { createAction, props } from '@ngrx/store';

export const loadGlobalesAS = createAction('[GlobalesAS List] Load Globales_AS');
export const loadedGlobalesAS = createAction(
	'[GlobalesAS List] Load Globales_AS success',
	props<{ globales: Iglobales_AS[] }>()
);
