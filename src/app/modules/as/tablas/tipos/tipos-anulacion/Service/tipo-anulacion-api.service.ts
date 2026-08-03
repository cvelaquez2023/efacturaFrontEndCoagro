import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResponseTipoAnulacion } from '../models/tipoAnulacion-api-model-interface';

const URL_TIPOANULACION = environment.host + '/AS/TipoAnulacion';
@Injectable({
	providedIn: 'root'
})
export class TipoAnulacionApiService {
	constructor(private _httpClient: HttpClient) {}
	get(page?: number, rows?: number): Observable<IResponse<IResponseTipoAnulacion[]>> {
		let url = URL_TIPOANULACION;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseTipoAnulacion[]>>(url);
	}
	create(tipoAnulacion: IResponseTipoAnulacion): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_TIPOANULACION, tipoAnulacion);
	}
	delete(idTipoAnulacion: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_TIPOANULACION + '/' + idTipoAnulacion;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	update(idTipoAnulacion: number, TipoAnulacion: IResponseTipoAnulacion): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_TIPOANULACION + '/' + idTipoAnulacion;
		return this._httpClient.put<IResponse<number>>(url, TipoAnulacion);
	}
}
