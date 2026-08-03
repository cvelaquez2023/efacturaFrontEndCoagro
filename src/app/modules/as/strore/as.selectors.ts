import { IGlobalesAS_State } from './as.state';
import { AppState } from '@app/config/app.state';
import { createSelector } from '@ngrx/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectGlobalesASFeature = (state: AppState) => state.globalesAS;

export const selectListGlobalesAS = createSelector(selectGlobalesASFeature, (state: IGlobalesAS_State) => state.items);

export const selectLoading = createSelector(selectGlobalesASFeature, (state: IGlobalesAS_State) => state.loading);
