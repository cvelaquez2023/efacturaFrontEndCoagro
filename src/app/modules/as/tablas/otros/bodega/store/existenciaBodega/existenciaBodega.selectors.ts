import { IExistenciaBodegaState } from './existenciaBodega.state';
import { createSelector } from '@ngrx/store';
import { AppState } from '@app/config/app.state';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectExistenciaBodegaFeacture = (state: AppState) => state.existenciaBodega;
export const selectListExistenciaBodega = createSelector(
	selectExistenciaBodegaFeacture,
	(state: IExistenciaBodegaState) => state.existenciaBodega
);
export const selectExistenciaBodegaLoading = createSelector(
	selectExistenciaBodegaFeacture,
	(state: IExistenciaBodegaState) => state.loading
);
