import { IConsultaTipoCambio } from './tipo-cambio-api-model-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse } from '@app/shared/api-models-base-interface';
const URL_TIPOCAMBIO = environment.host + '/AS/TipoCambio';
@Injectable({
	providedIn: 'root'
})
export class TipoCambioApiService {
	constructor(private _httpClient: HttpClient) {}
	getTipoCambio(page?: number, rows?: number): Observable<IResponse<IConsultaTipoCambio[]>> {
		let url = URL_TIPOCAMBIO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IConsultaTipoCambio[]>>(url);
	}

	delete(idTipoCambio: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_TIPOCAMBIO + '/' + idTipoCambio;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
