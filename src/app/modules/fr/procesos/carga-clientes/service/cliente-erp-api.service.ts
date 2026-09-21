import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponseClienteErp, IResponsePaginadaClienteErp } from '../model/cliente-erp-fr-model-interface';

const URL_CLIENTE_ERP = environment.host + '/fr/clienteErp';

@Injectable({
	providedIn: 'root'
})
export class ClienteErpApiService {
	constructor(private _httpClient: HttpClient) {}

	/** Consulta paginada de los clientes ya existentes en el ERP (solo lectura, no se crean aquí). */
	getClientesErp(
		q: string,
		page: number,
		limit: number,
		activo?: string
	): Observable<IResponsePaginadaClienteErp<IResponseClienteErp[]>> {
		let params = new HttpParams().set('page', page).set('limit', limit);
		if (q) {
			params = params.set('q', q);
		}
		if (activo) {
			params = params.set('activo', activo);
		}
		return this._httpClient.get<IResponsePaginadaClienteErp<IResponseClienteErp[]>>(URL_CLIENTE_ERP, { params });
	}
}
