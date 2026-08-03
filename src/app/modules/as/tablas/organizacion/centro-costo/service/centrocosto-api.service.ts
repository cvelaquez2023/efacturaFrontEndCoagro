import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponseCentroCosto } from './centrocosto-api-model-interface';
import { Observable } from 'rxjs';
import { IResponse } from '@app/shared/api-models-base-interface';
import { IRequestCentroCosto } from './centrocosto-api-model-interface';

const URL_CENTROCOSTO = environment.host + '/AS/CentroCosto';

@Injectable({
	providedIn: 'root'
})
export class CentrocostoApiService {
	constructor(private _httpClient: HttpClient) {}
	getCentroCosto(page?: number, rows?: number): Observable<IResponse<IResponseCentroCosto[]>> {
		let url = URL_CENTROCOSTO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCentroCosto[]>>(url);
	}
	createCentroCosto(centrocosto: IRequestCentroCosto): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CENTROCOSTO, centrocosto);
	}
	deleteCentroCosto(idCentroCosto: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CENTROCOSTO + '/' + idCentroCosto;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	updateCentroCosto(idCentroCosto: number, centroCosto: IRequestCentroCosto): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CENTROCOSTO + '/' + idCentroCosto;
		return this._httpClient.put<IResponse<number>>(url, centroCosto);
	}
}
