import {
	ICondicionPagoCreate,
	ICondicionPagoConsulta,
	ICondicionPagoEdit
} from './../models/condicionPago-api-model-interface';
import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../../environments/environment';
import { Injectable } from '@angular/core';

const URL_CONDICION_PAGO = environment.host + '/AS/CondicionPago';
@Injectable({
	providedIn: 'root'
})
export class CondicionPagoApiService {
	constructor(private _httpClient: HttpClient) {}
	getCondicionPago(page?: number, rows?: number): Observable<IResponse<ICondicionPagoConsulta[]>> {
		let url = URL_CONDICION_PAGO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<ICondicionPagoConsulta[]>>(url);
	}
	createCondicionPago(datos: ICondicionPagoCreate): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CONDICION_PAGO, datos);
	}
	deleteCondicionPago(id: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CONDICION_PAGO + '/' + id;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	updateCondicionPago(id: number, datos: ICondicionPagoEdit): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CONDICION_PAGO + '/' + id;
		return this._httpClient.put<IResponse<number>>(url, datos);
	}
}
