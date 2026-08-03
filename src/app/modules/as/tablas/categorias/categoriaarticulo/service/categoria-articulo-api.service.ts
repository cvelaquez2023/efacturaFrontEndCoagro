import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICreateCategoriaArticulo, IResponseCategoriaArticulo } from './categoria-articulo-api-model-interface';

const URL_CATARTICULO = environment.host + '/CI/CategoriaArticulo';
@Injectable({
	providedIn: 'root'
})
export class CategoriaArticuloApiService {
	constructor(private _httpClient: HttpClient) {}
	getCatArticulo(page?: number, rows?: number): Observable<IResponse<IResponseCategoriaArticulo[]>> {
		let url = URL_CATARTICULO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCategoriaArticulo[]>>(url);
	}
	createCatArticulo(catArticulo: ICreateCategoriaArticulo): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CATARTICULO, catArticulo);
	}
	delete(idCatArticulo: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CATARTICULO + '/' + idCatArticulo;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	updateCategoria(idCategoaria: number, categoria: ICreateCategoriaArticulo): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CATARTICULO + '/' + idCategoaria;
		return this._httpClient.put<IResponse<number>>(url, categoria);
	}
}
