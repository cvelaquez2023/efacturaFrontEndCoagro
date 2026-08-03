import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { IResponsePeriodosContables } from '../model/peridoContable-api-model-interface';
const URL_PERIODOCONTABLEC = environment.host + '/AS/PeriodoContable';
const URL_PERIODOCONTABLER = environment.host + '/AS/PeriodoContable';
const URL_PERIODOCONTABLEU = environment.host + '/AS/PeriodoContable';
const URL_PERIODOCONTABLED = environment.host + '/AS/PeriodoContable';
@Injectable({
	providedIn: 'root'
})
export class PeriodoContableApiService {
	constructor(private _httpClient: HttpClient) {}
	getPeriodoContable(page?: number, rows?: number): Observable<IResponse<IResponsePeriodosContables[]>> {
		let url = URL_PERIODOCONTABLER;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponsePeriodosContables[]>>(url);
	}
	createPeriodoContable(periodoContable: IResponsePeriodosContables): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_PERIODOCONTABLEC, periodoContable);
	}
	deletePeriodoContable(idPeriodoContable: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_PERIODOCONTABLED + '/' + idPeriodoContable;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	updatePeriodoContable(
		idPeriodoContable: number,
		periodoContable: IResponsePeriodosContables
	): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_PERIODOCONTABLEU + '/' + idPeriodoContable;
		return this._httpClient.put<IResponse<number>>(url, periodoContable);
	}
}
