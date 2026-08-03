/* eslint-disable prefer-const */
import { IResponseCreateBodega, IResponseLocaizacionBodega } from './bodega-api-model-interface';
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { IResponseBodega } from './bodega-api-model-interface';
import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../../environments/environment';
import { Injectable } from '@angular/core';
const URL_BODEGA = environment.host + '/AS/Bodega';
const URL_LOCALIZACIONES = environment.host + '/AS/Localizaciones';
const URL_USUARIO_BODEGA = environment.host + '/AS/UsuarioBodega';
@Injectable({
	providedIn: 'root'
})
export class BodegaApiService {
	constructor(private _httpClient: HttpClient) {}
	getBodega(page?: number, rows?: number): Observable<IResponse<IResponseBodega[]>> {
		let url = URL_BODEGA;
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseBodega[]>>(url);
	}
	crearBodega(bodega: IResponseCreateBodega): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_BODEGA, bodega);
	}
	delete(idBodega: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_BODEGA + '/' + idBodega;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	update(idBodega: number, bodega: IResponseCreateBodega): Observable<IResponse<number>> {
		const url = URL_BODEGA + '/' + idBodega;
		return this._httpClient.put<IResponse<number>>(url, bodega);
	}
	getBodegaLocalizacion(idBodega: number): Observable<IResponse<IResponseLocaizacionBodega[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_LOCALIZACIONES + '/' + idBodega;
		return this._httpClient.get<IResponse<IResponseLocaizacionBodega[]>>(url);
	}
	getLocalizacionesAll(): Observable<IResponse<IResponseLocaizacionBodega[]>> {
		let url = URL_LOCALIZACIONES;
		return this._httpClient.get<IResponse<IResponseLocaizacionBodega[]>>(url);
	}
}
