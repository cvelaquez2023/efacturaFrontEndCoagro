import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from './../../../../../../../environments/environment';
import { IRequestCreateRuta, IResponseRuta } from './ruta-api-model-interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const URL_RUTA = environment.host + '/AS/Ruta';
@Injectable({
	providedIn: 'root'
})
export class RutaApiService {
	constructor(private _httpClient: HttpClient) {}

	getRutas(page?: number, rows?: number): Observable<IResponse<IResponseRuta[]>> {
		let url = URL_RUTA;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseRuta[]>>(url);
	}
	createRuta(ruta: IRequestCreateRuta): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_RUTA, ruta);
	}
	delete(idRuta: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_RUTA + '/' + idRuta;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	update(idRuta: number, ruta: IRequestCreateRuta): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_RUTA + '/' + idRuta;
		return this._httpClient.put<IResponse<number>>(url, ruta);
	}
}
