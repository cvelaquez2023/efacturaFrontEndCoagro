import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponseBodegaErp, IResponsePaginadaBodegaErp } from '../model/bodega-erp-fr-model-interface';

const URL_BODEGA_ERP = environment.host + '/fr/bodegaErp';

@Injectable({
	providedIn: 'root'
})
export class BodegaErpApiService {
	constructor(private _httpClient: HttpClient) {}

	/** Consulta paginada de las bodegas ya existentes en el ERP (solo lectura, no se crean aqui). */
	getBodegasErp(q: string, page: number, limit: number): Observable<IResponsePaginadaBodegaErp<IResponseBodegaErp[]>> {
		let params = new HttpParams().set('page', page).set('limit', limit);
		if (q) {
			params = params.set('q', q);
		}
		return this._httpClient.get<IResponsePaginadaBodegaErp<IResponseBodegaErp[]>>(URL_BODEGA_ERP, { params });
	}
}
