import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IResponsePaginada } from '@app/shared/api-models-base-interface';
import { ICreateBodegaFrModel, IResponseBodegaFr } from '../model/bodega-fr-model-interface';

const URL_BODEGA = environment.host + '/fr/bodegaRt';

@Injectable({
	providedIn: 'root'
})
export class BodegaFrApiService {
	constructor(private _httpClient: HttpClient) {}

	getBodegas(page?: number, limit?: number): Observable<IResponsePaginada<IResponseBodegaFr[]>> {
		let params = new HttpParams();
		if (page != null) params = params.set('page', page);
		if (limit != null) params = params.set('limit', limit);
		return this._httpClient.get<IResponsePaginada<IResponseBodegaFr[]>>(URL_BODEGA, { params });
	}
	createBodega(bodega: ICreateBodegaFrModel): Observable<IResponse<IResponseBodegaFr>> {
		return this._httpClient.post<IResponse<IResponseBodegaFr>>(URL_BODEGA, bodega);
	}
	updateBodega(bodega: string, data: { nombre: string }): Observable<IResponse<number>> {
		const url = URL_BODEGA + '/' + encodeURIComponent(bodega);
		return this._httpClient.put<IResponse<number>>(url, data);
	}
	deleteBodega(bodega: string): Observable<IResponse<number>> {
		const url = URL_BODEGA + '/' + encodeURIComponent(bodega);
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
