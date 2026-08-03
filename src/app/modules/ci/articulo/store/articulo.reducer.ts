import { loadArticuloAccion, loadedArticuloAccion } from './articulo.actions';
import { createReducer, on } from '@ngrx/store';
import { IArticuloCI_State } from './articulo.state';

export const initialStateArticulo: IArticuloCI_State = { loading: false, articulo: [] };
export const articuloReducer = createReducer(
	initialStateArticulo,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadArticuloAccion, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedArticuloAccion, (state, { articulo }) => {
		return { ...state, loading: false, articulo };
	})
);
