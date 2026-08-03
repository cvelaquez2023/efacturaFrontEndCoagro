import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import {
	IResponseCreateExistenciaBodega,
	IResponseConsultarExistenciaBodega,
	IResponseConsultarArticuloBodega
} from './existenciaBodega-api-model-interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
const URL_EXISTBODEGA = environment.host + '/CI/ExistenciaBodega';

@Injectable({
	providedIn: 'root'
})
export class ExistenciaBodegaApiService {
	constructor(private _httpClient: HttpClient) {}
	getExistenciaBodega(page?: number, rows?: number): Observable<IResponse<IResponseConsultarExistenciaBodega[]>> {
		let url = URL_EXISTBODEGA;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseConsultarExistenciaBodega[]>>(url);
	}
	/* Se muestra los articulos con las bodegas y su detalle de cada una articulo,bodega */
	getall(page?: number, rows?: number): Observable<IResponse<IResponseConsultarArticuloBodega[]>> {
		let url = URL_EXISTBODEGA;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseConsultarArticuloBodega[]>>(url);
	}

	crearExistenciaBodega(existBodega: IResponseCreateExistenciaBodega): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_EXISTBODEGA, existBodega);
	}
	getExistenciaBodegaArticulo(articuloId: number): Observable<IResponse<IResponseConsultarExistenciaBodega[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_EXISTBODEGA + '/' + articuloId;
		return this._httpClient.get<IResponse<IResponseConsultarExistenciaBodega[]>>(url);
	}
	updateExistenciaBodega(id: number, existenciaBodega: IResponseCreateExistenciaBodega): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_EXISTBODEGA + '/' + id;
		return this._httpClient.put<IResponse<number>>(url, existenciaBodega);
	}
}
