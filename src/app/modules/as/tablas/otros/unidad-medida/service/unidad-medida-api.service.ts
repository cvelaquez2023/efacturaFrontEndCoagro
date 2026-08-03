import { ICreateUnidadMedida, IResponseUnidadMedida } from './unidad-medida-api-model-interface';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const URL_UNIDADMEDIDA = environment.host + '/AS/UnidadMedida';

@Injectable({
	providedIn: 'root'
})
export class UnidadMedidaApiService {
	constructor(private _httpClient: HttpClient) {}
	getUnidadMedida(page?: number, rows?: number): Observable<IResponse<IResponseUnidadMedida[]>> {
		let url = URL_UNIDADMEDIDA;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseUnidadMedida[]>>(url);
	}
	crearBodega(unidadMedida: ICreateUnidadMedida): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_UNIDADMEDIDA, unidadMedida);
	}
	delete(idUnidadMedida: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_UNIDADMEDIDA + '/' + idUnidadMedida;
		return this._httpClient.delete<IResponse<number>>(url);
	}

	update(idUnidadMedida: number, unidadMedida: ICreateUnidadMedida): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_UNIDADMEDIDA + '/' + idUnidadMedida;
		return this._httpClient.put<IResponse<number>>(url, unidadMedida);
	}
}
