import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { IResponseClasificacion, ICreateClasificacion } from './clasificacion-api-model-interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const URL_CLASIFICACION = environment.host + '/CI/clasificacionInv';
@Injectable({
	providedIn: 'root'
})
export class ClasificacionApiService {
	constructor(private _httpClient: HttpClient) {}
	createClasifi(clasificacion: ICreateClasificacion): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CLASIFICACION, clasificacion);
	}
	getClasifi(page?: number, rows?: number): Observable<IResponse<IResponseClasificacion[]>> {
		let url = URL_CLASIFICACION;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseClasificacion[]>>(url);
	}
	deleteClasifi(idZona: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CLASIFICACION + '/' + idZona;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
