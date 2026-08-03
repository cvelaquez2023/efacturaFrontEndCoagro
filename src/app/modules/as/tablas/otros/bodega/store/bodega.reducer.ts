import { IBodega_State } from './bodega.state';
import { loadBodegaAccion, loadedBodegaAccion } from './bodega.actions';
import { createReducer, on } from '@ngrx/store';

export const initialBodegaState: IBodega_State = { loading: false, bodega: [] };
export const bodegaReducer = createReducer(
	initialBodegaState,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadBodegaAccion, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedBodegaAccion, (state, { bodega }) => {
		return { ...state, loading: false, bodega };
	})
);
