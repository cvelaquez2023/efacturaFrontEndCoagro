import { environment } from './../../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { IResponseNivelPrecio, IRequestCreateNivelPrecio } from './nivel-precio-api-model-interface';

const URL_NIVELPRECIO = environment.host + '/AS/NivelPrecio';
@Injectable({
	providedIn: 'root'
})
export class NivelPrecioApiService {
	constructor(private _httpClient: HttpClient) {}
	getNivelPrecio(page?: number, rows?: number): Observable<IResponse<IResponseNivelPrecio[]>> {
		let url = URL_NIVELPRECIO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;

		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		// eslint-disable-next-line no-self-assign
		url = url;
		return this._httpClient.get<IResponse<IResponseNivelPrecio[]>>(url);
	}
	createNivelPrecio(nivelPrecio: IRequestCreateNivelPrecio): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_NIVELPRECIO, nivelPrecio);
	}
	deleteNivelprecios(idNivelprecio: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_NIVELPRECIO + '/' + idNivelprecio;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	updateNivelprecio(id: number, datos: IRequestCreateNivelPrecio): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_NIVELPRECIO + '/' + id;
		return this._httpClient.put<IResponse<number>>(url, datos);
	}
}
