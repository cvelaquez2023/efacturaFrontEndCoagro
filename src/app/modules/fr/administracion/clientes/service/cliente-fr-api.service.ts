import { EMPTY, Observable } from 'rxjs';
import { expand, reduce } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IResponsePaginada } from '@app/shared/api-models-base-interface';
import { ICreateClienteFrModel, IResponseClienteFr } from '../model/cliente-fr-model-interface';

const URL_CLIENTE = environment.host + '/fr/clienteRt';
const LIMIT_PAGINA = 100;

@Injectable({
	providedIn: 'root'
})
export class ClienteFrApiService {
	constructor(private _httpClient: HttpClient) {}

	getClientes(page?: number, limit?: number): Observable<IResponsePaginada<IResponseClienteFr[]>> {
		let params = new HttpParams();
		if (page != null) params = params.set('page', page);
		if (limit != null) params = params.set('limit', limit);
		return this._httpClient.get<IResponsePaginada<IResponseClienteFr[]>>(URL_CLIENTE, { params });
	}

	/** Recorre todas las páginas y devuelve, en un solo arreglo, todos los clientes de clienteRt. */
	getAllClientes(): Observable<IResponseClienteFr[]> {
		const pagina = (page: number) => this.getClientes(page, LIMIT_PAGINA);
		return pagina(1).pipe(
			expand((response) =>
				response.pagination && response.pagination.page < response.pagination.totalPages ? pagina(response.pagination.page + 1) : EMPTY
			),
			reduce((acumulado: IResponseClienteFr[], response) => acumulado.concat(response.result || []), [] as IResponseClienteFr[])
		);
	}
	createCliente(cliente: ICreateClienteFrModel): Observable<IResponse<IResponseClienteFr>> {
		return this._httpClient.post<IResponse<IResponseClienteFr>>(URL_CLIENTE, cliente);
	}
	updateCliente(cliente: string, data: ICreateClienteFrModel): Observable<IResponse<number>> {
		const url = URL_CLIENTE + '/' + encodeURIComponent(cliente);
		return this._httpClient.put<IResponse<number>>(url, data);
	}
	deleteCliente(cliente: string): Observable<IResponse<number>> {
		const url = URL_CLIENTE + '/' + encodeURIComponent(cliente);
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
