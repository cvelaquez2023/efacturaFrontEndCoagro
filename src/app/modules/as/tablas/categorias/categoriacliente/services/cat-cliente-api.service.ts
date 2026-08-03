/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { IRequestCreateCatCliente, IResponseCatCliente } from './../model/catCliente-api-model-interface';
import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from './../../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const URL_CATEGORIACLIENTE = environment.host + '/AS/CategoriaCliente';
@Injectable({
	providedIn: 'root'
})
export class CatClienteApiService {
	constructor(private _httpClient: HttpClient) {}
	getCategoriaCliente(page?: number, rows?: number): Observable<IResponse<IResponseCatCliente[]>> {
		let url = URL_CATEGORIACLIENTE;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCatCliente[]>>(url);
	}
	createCategoriaCliente(categoria: IRequestCreateCatCliente): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CATEGORIACLIENTE, categoria);
	}
	updateCategoriaCliente(idCategoaria: number, categoria: IRequestCreateCatCliente): Observable<IResponse<number>> {
		const url = URL_CATEGORIACLIENTE + '/' + idCategoaria;
		return this._httpClient.put<IResponse<number>>(url, categoria);
	}
	deleteCategoriaCliente(idCat: number): Observable<IResponse<number>> {
		const url = URL_CATEGORIACLIENTE + '/' + idCat;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
