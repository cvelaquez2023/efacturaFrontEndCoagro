import { createAction, props } from '@ngrx/store';
import { ICondicionPagoConsulta } from './../models/condicionPago-api-model-interface';

export const loadCondicionPagoAccion = createAction('[CondicionPago List] Load CondicionPago');
export const loadedCondicionPagoAccion = createAction(
	'[CondicionPago List] Load CondicionPago success',
	props<{ condicionPago: ICondicionPagoConsulta[] }>()
);
