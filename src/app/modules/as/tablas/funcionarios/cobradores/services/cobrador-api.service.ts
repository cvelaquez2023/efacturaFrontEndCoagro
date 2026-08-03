import { IResponseCobrador, IRequestCreateCobrador } from './cobrador-api-model-interface';
import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const URL_COBRADOR = environment.host + '/AS/Cobrador';
@Injectable({
	providedIn: 'root'
})
export class CobradorApiService {
	constructor(private _httpClient: HttpClient) {}
	getCobrador(page?: number, rows?: number): Observable<IResponse<IResponseCobrador[]>> {
		let url = URL_COBRADOR;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCobrador[]>>(url);
	}
	createCobrador(cobrador: IRequestCreateCobrador): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_COBRADOR, cobrador);
	}
	delete(idCobrador: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_COBRADOR + '/' + idCobrador;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	update(idCobrador: number, cobrador: IRequestCreateCobrador): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_COBRADOR + '/' + idCobrador;
		return this._httpClient.put<IResponse<number>>(url, cobrador);
	}
}
