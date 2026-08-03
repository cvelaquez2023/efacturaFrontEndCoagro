import { ExistenciaBodegaApiService } from './../../service/existenciaBodega-api.service';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';
@Injectable()
export class existenciaBodegaEffect {
	loadExistenciaBodega$ = createEffect(() => {
		return this.actions$.pipe(
			// eslint-disable-next-line ngrx/prefer-action-creator-in-of-type
			ofType('[ExistenciaBodega List] Load ExistenciaBodega'),
			mergeMap(() =>
				this._ExistenciaBodegaApiService.getall(1, 1000000).pipe(
					map((datos) => ({ type: '[ExistenciaBodega List] Load ExistenciaBodega success', existenciaBodega: datos })),
					catchError(() => EMPTY)
				)
			)
		);
	});

	constructor(private actions$: Actions, private _ExistenciaBodegaApiService: ExistenciaBodegaApiService) {}
}
