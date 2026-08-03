import { mergeMap, map, catchError } from 'rxjs/operators';
import { BodegaApiService } from './../../service/bodega-api.service';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';

@Injectable()
export class localizacionEffect {
	loadLocalizacion$ = createEffect(() => {
		return this.actions$.pipe(
			// eslint-disable-next-line ngrx/prefer-action-creator-in-of-type
			ofType('[Localizacion List] Load Localizacion'),
			mergeMap(() =>
				this._bodegaApiService.getLocalizacionesAll().pipe(
					map((datos) => ({ type: '[Localizacion List] Load Localizacion success', localizacion: datos })),
					catchError(() => EMPTY)
				)
			)
		);
	});
	constructor(private actions$: Actions, private _bodegaApiService: BodegaApiService) {}
}
