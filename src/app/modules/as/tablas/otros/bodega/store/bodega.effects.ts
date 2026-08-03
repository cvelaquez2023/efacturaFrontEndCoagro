import { map, mergeMap, catchError } from 'rxjs/operators';
import { BodegaApiService } from './../service/bodega-api.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';

@Injectable()
export class bodegaEffect {
	loadBodega$ = createEffect(() => {
		return this.actions$.pipe(
			ofType('[Bodega List] Load Bodega'),
			mergeMap(() =>
				this._bodegaApiService.getBodega(1, 1000).pipe(
					map((datos) => ({ type: '[Bodega List] Load Bodega success', bodega: datos })),
					catchError(() => EMPTY)
				)
			)
		);
	});

	constructor(private actions$: Actions, private _bodegaApiService: BodegaApiService) {}
}
