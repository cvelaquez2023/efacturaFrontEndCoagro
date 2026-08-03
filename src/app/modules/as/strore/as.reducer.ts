import { IGlobalesAS_State } from './as.state';
import { loadGlobalesAS, loadedGlobalesAS } from './as.actions';
import { createReducer, on } from '@ngrx/store';

export const initialState: IGlobalesAS_State = { loading: false, items: [] };

export const globalesASReducer = createReducer(
	initialState,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadGlobalesAS, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedGlobalesAS, (state, { globales }) => {
		return { ...state, loading: false, items: globales };
	})
);
