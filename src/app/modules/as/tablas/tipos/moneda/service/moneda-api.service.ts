/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse } from '@app/shared/api-models-base-interface';
import { ICreateMonedaModel } from '../model/moneda-api-model-interface';

const URL_MONEDA = environment.host + '/AS/Moneda';
@Injectable({
	providedIn: 'root'
})
export class MonedaApiService {
	constructor(private _httpClient: HttpClient) {}
	getMoneda(page?: number, rows?: number): Observable<IResponse<ICreateMonedaModel[]>> {
		let url = URL_MONEDA;
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<ICreateMonedaModel[]>>(url);
	}
	createMoneda(moneda: ICreateMonedaModel): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_MONEDA, moneda);
	}
	deleteMoneda(id: number): Observable<IResponse<number>> {
		const url = URL_MONEDA + '/' + id;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	updateMoneda(id: number, data: ICreateMonedaModel): Observable<IResponse<number>> {
		const url = URL_MONEDA + '/' + id;
		return this._httpClient.put<IResponse<number>>(url, data);
	}
}
