import { ILoteState } from './lote.state';
import { createSelector } from '@ngrx/store';
import { AppState } from '@app/config/app.state';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectLote = (state: AppState) => state.lote;
export const selectListLote = createSelector(selectLote, (state: ILoteState) => state.lote);
export const selectLoadingLote = createSelector(selectLote, (state: ILoteState) => state.loading);
