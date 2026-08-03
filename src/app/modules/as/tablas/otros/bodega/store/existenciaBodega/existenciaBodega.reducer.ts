import { loadExistenciaBodega, loadedExistenciaBodega } from './existenciaBodega.actions';
import { createReducer, on } from '@ngrx/store';
import { IExistenciaBodegaState } from './existenciaBodega.state';

export const initialExistenciaBodega: IExistenciaBodegaState = { loading: false, existenciaBodega: [] };
export const exsitenciaBodegaReducer = createReducer(
	initialExistenciaBodega,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadExistenciaBodega, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedExistenciaBodega, (state, { existenciaBodega }) => {
		return { ...state, loading: false, existenciaBodega };
		console.log('existenciaBodega', existenciaBodega);
	})
);
