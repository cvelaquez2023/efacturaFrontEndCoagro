import { loadedGlobalesCI, loadGlobalesCI } from './ci.actions';
import { createReducer, on } from '@ngrx/store';
import { IGlobalesCI_State } from './ci.state';

export const initialStateGlobalesCI: IGlobalesCI_State = { loading: false, datos: [] };

export const globalesCIReducer = createReducer(
	initialStateGlobalesCI,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadGlobalesCI, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedGlobalesCI, (state, { globalesCI }) => {
		return { ...state, loading: false, datos: globalesCI };
	})
);
