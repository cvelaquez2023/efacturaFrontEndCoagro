import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse } from '@app/shared/api-models-base-interface';
import { ICreateRutaModel, IResponseRuta } from '../model/ruta-fr-model-interface';

const URL_RUTA = environment.host + '/fr/rutaRt';

@Injectable({
	providedIn: 'root'
})
export class RutaApiService {
	constructor(private _httpClient: HttpClient) {}

	getRutas(activa?: string, grupoTelefono?: string): Observable<IResponse<IResponseRuta[]>> {
		const params: string[] = [];
		if (activa) params.push('activa=' + encodeURIComponent(activa));
		if (grupoTelefono) params.push('grupoTelefono=' + encodeURIComponent(grupoTelefono));
		const url = URL_RUTA + (params.length ? '?' + params.join('&') : '');
		return this._httpClient.get<IResponse<IResponseRuta[]>>(url);
	}
	createRuta(ruta: ICreateRutaModel): Observable<IResponse<IResponseRuta>> {
		return this._httpClient.post<IResponse<IResponseRuta>>(URL_RUTA, ruta);
	}
	updateRuta(ruta: string, data: ICreateRutaModel): Observable<IResponse<number>> {
		const url = URL_RUTA + '/' + encodeURIComponent(ruta);
		return this._httpClient.put<IResponse<number>>(url, data);
	}
	deleteRuta(ruta: string): Observable<IResponse<number>> {
		const url = URL_RUTA + '/' + encodeURIComponent(ruta);
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
