import { loadLoteAccion, loadedLoteAccion } from './lote.actions';
import { createReducer, on } from '@ngrx/store';
import { ILoteState } from './lote.state';
export const initialStateLote: ILoteState = { loading: false, lote: [] };
export const loteReducer = createReducer(
	initialStateLote,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadLoteAccion, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedLoteAccion, (state, { lote }) => {
		return { ...state, loading: false, lote };
	})
);
