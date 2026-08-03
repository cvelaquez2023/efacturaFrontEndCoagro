/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IBodega_State } from './bodega.state';
import { AppState } from '@app/config/app.state';
import { createSelector } from '@ngrx/store';

export const selectBodegaFeature = (state: AppState) => state.bodega;
export const selectListBodega = createSelector(selectBodegaFeature, (state: IBodega_State) => state.bodega);
export const selectBodegaLoading = createSelector(selectBodegaFeature, (state: IBodega_State) => state.loading);
