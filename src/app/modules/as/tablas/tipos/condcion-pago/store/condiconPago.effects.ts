import { mergeMap, map, catchError } from 'rxjs/operators';
import { CondicionPagoApiService } from './../service/condicionPago-api.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { EMPTY } from 'rxjs';

@Injectable()
export class condicionPagoEffects {
	condicionPago$ = createEffect(() => {
		return this._actions$.pipe(
			// eslint-disable-next-line ngrx/prefer-action-creator-in-of-type
			ofType('[CondicionPago List] Load CondicionPago'),
			mergeMap(() =>
				this._condicionPagoApiService.getCondicionPago(1, 10000).pipe(
					map((datos) => ({ type: '[CondicionPago List] Load CondicionPago success', condicionPago: datos })),
					catchError(() => EMPTY)
				)
			)
		);
	});
	constructor(private _actions$: Actions, private _condicionPagoApiService: CondicionPagoApiService) {}
}
