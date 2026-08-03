import { createReducer, on } from '@ngrx/store';
import { loadCondicionPagoAccion, loadedCondicionPagoAccion } from './condicionPago.actions';
import { ICondicionPagoState } from './condiconPago.state';

export const initialStateCondicionPago: ICondicionPagoState = { loading: false, condicionPago: [] };
export const CondicionPagoReducer = createReducer(
	initialStateCondicionPago,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadCondicionPagoAccion, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedCondicionPagoAccion, (state, { condicionPago }) => {
		//console.log('condicion Pago', condicionPago);
		return { ...state, loading: false, condicionPago };
	})

	// eslint-disable-next-line ngrx/on-function-explicit-return-type
);
