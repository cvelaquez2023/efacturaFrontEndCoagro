import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { IConsultaPais, ICrearPais } from './pais-api-model-interface';
import { environment } from 'src/environments/environment';

const URL_PAIS = environment.host + '/AS/Pais';
@Injectable({
	providedIn: 'root'
})
export class PaisApiService {
	constructor(private _httpClient: HttpClient) {}
	getPaises(page?: number, rows?: number): Observable<IResponse<IConsultaPais[]>> {
		let url = URL_PAIS;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IConsultaPais[]>>(url);
	}
	createPais(pais: ICrearPais): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_PAIS, pais);
	}
	delete(idPais: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_PAIS + '/' + idPais;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	update(id: number, pais: ICrearPais): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_PAIS + '/' + id;
		return this._httpClient.put<IResponse<number>>(url, pais);
	}
}
