import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResponseTipoImpuesto } from '../models/tipoImpuesto_api_model_interface';

const URL_TIPOIMPUESTO = environment.host + '/AS/TipoImpuesto';
@Injectable({
	providedIn: 'root'
})
export class TipoImpuestoApiService {
	constructor(private _httpClient: HttpClient) {}
	get(page?: number, rows?: number): Observable<IResponse<IResponseTipoImpuesto[]>> {
		let url = URL_TIPOIMPUESTO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseTipoImpuesto[]>>(url);
	}
	create(tipoAnulacion: IResponseTipoImpuesto): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_TIPOIMPUESTO, tipoAnulacion);
	}
	delete(id: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_TIPOIMPUESTO + '/' + id;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	update(id: number, TipoImpuesto: IResponseTipoImpuesto): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_TIPOIMPUESTO + '/' + id;
		return this._httpClient.put<IResponse<number>>(url, TipoImpuesto);
	}
}
