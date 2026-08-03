import { GlobalesCIApiService } from './../services/globales-ci-api.service';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

@Injectable()
export class globalesCiEffects {
	loadGlobalesCI$ = createEffect(() => {
		return this.actions$.pipe(
			// eslint-disable-next-line ngrx/prefer-action-creator-in-of-type
			ofType('[GlobalesCI List] Load Globales_CI'),
			mergeMap(() =>
				this.globalesCIApiService.getGlobalesCI(1, 1000).pipe(
					map((datos) => ({ type: '[GlobalesAS List] Load Globales_CI success', datos })),
					catchError(() => EMPTY)
				)
			)
		);
	});
	constructor(private actions$: Actions, private globalesCIApiService: GlobalesCIApiService) {}
}
