/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ILocalizacionState } from './loc.state';
import { AppState } from '@app/config/app.state';
import { createSelector } from '@ngrx/store';

export const selectLocalizacionFeacture = (state: AppState) => state.localizacion;
export const selectListLocalizacion = createSelector(
	selectLocalizacionFeacture,
	(state: ILocalizacionState) => state.localizacion
);
export const selectLocalizacionLoading = createSelector(
	selectLocalizacionFeacture,
	(state: ILocalizacionState) => state.loading
);
