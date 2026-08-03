import { environment } from './../../../../../../../environments/environment';
import { IResponse } from './../../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { IRequestCreateZona, IResponseZona } from './zona-api-model-interfaces';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const URL_ZONA = environment.host + '/AS/Zona';
@Injectable({
	providedIn: 'root'
})
export class ZonaApiService {
	constructor(private _httpClient: HttpClient) {}
	createZona(zona: IRequestCreateZona): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_ZONA, zona);
	}
	getZonas(page?: number, rows?: number): Observable<IResponse<IResponseZona[]>> {
		let url = URL_ZONA;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseZona[]>>(url);
	}

	update(idZona: number, zona: IRequestCreateZona): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_ZONA + '/' + idZona;
		return this._httpClient.put<IResponse<number>>(url, zona);
	}

	delete(idZona: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_ZONA + '/' + idZona;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
