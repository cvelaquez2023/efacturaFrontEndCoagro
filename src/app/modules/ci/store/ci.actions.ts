import { createAction, props } from '@ngrx/store';
import { Iglobales_CI } from '../model/globales_CI.interface';

export const loadGlobalesCI = createAction('[GlobalesCI List] Load Globales_CI');
export const loadedGlobalesCI = createAction(
	'[GlobalesCI List] Load Globales_CI success',
	// eslint-disable-next-line ngrx/prefer-inline-action-props
	props<{ globalesCI: Iglobales_CI[] }>()
);
