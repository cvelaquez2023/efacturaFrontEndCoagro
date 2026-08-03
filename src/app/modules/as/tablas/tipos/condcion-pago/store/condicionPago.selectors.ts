import { ICondicionPagoState } from './condiconPago.state';
import { createSelector } from '@ngrx/store';
import { AppState } from './../../../../../../config/app.state';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectCondicionPago = (state: AppState) => state.condicionPago;
export const selectListCondicionPago = createSelector(
	selectCondicionPago,
	(state: ICondicionPagoState) => state.condicionPago
);
export const selectLoadingCondicionPago = createSelector(
	selectCondicionPago,
	(state: ICondicionPagoState) => state.loading
);
