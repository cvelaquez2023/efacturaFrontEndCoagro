import { IArticuloCI_State } from './articulo.state';
import { createSelector } from '@ngrx/store';
import { AppState } from '@app/config/app.state';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectArticulo = (state: AppState) => state.articulo;
export const selectListArticulo = createSelector(selectArticulo, (state: IArticuloCI_State) => state.articulo);
export const selectLoadingArticulo = createSelector(selectArticulo, (state: IArticuloCI_State) => state.loading);
