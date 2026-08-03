import { ILocalizacionState } from './loc.state';
import { loadLocalizacionAccion, loadedLocalizacionAccion } from './loc.actions';
import { createReducer, on } from '@ngrx/store';

export const initialLocalizacionState: ILocalizacionState = { loading: false, localizacion: [] };
export const localizacionReducer = createReducer(
	initialLocalizacionState,
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadLocalizacionAccion, (state) => {
		return { ...state, loading: true };
	}),
	// eslint-disable-next-line ngrx/on-function-explicit-return-type
	on(loadedLocalizacionAccion, (state, { localizacion }) => {
		return { ...state, loading: false, localizacion };
	})
);
