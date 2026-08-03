import { IGlobalesCI_State } from './ci.state';
import { createSelector } from '@ngrx/store';
import { AppState } from './../../../config/app.state';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectGlobalesCI = (state: AppState) => state.globalesCI;
export const selectListGlobalesCI = createSelector(selectGlobalesCI, (state: IGlobalesCI_State) => state.datos);
export const selectLoadingCI = createSelector(selectGlobalesCI, (state: IGlobalesCI_State) => state.loading);
