import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IRequestCreateCtaProveedor, IResponseCtaProveedor } from '../model/ctaProveedor-api-model-interface';
import { Observable } from 'rxjs';
import { IResponse } from '@app/shared/api-models-base-interface';

const URL_CATEGORIAPROVEEDOR = environment.host + '/AS/CategoriaProveedor';
@Injectable({
	providedIn: 'root'
})
export class CtaProveedorApiService {
	constructor(private _httpClient: HttpClient) {}
	getCategoriaProveedor(page?: number, rows?: number): Observable<IResponse<IResponseCtaProveedor[]>> {
		let url = URL_CATEGORIAPROVEEDOR;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCtaProveedor[]>>(url);
	}
	createCategoriaProveedor(categoria: IRequestCreateCtaProveedor): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CATEGORIAPROVEEDOR, categoria);
	}
	updateCategoriaProveedor(idCategoaria: number, categoria: IRequestCreateCtaProveedor): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CATEGORIAPROVEEDOR + '/' + idCategoaria;
		return this._httpClient.put<IResponse<number>>(url, categoria);
	}
	deleteCategoriaProveedor(idCat: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CATEGORIAPROVEEDOR + '/' + idCat;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
