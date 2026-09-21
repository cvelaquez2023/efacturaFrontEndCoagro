import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse } from '@app/shared/api-models-base-interface';
import { ICreateVisitaModel, IResponseVisita } from '../model/visita-api-model-interface';

const URL_VISITA = environment.host + '/fr/visita';

@Injectable({
	providedIn: 'root'
})
export class VisitaApiService {
	constructor(private _httpClient: HttpClient) {}

	getVisitas(ruta?: string, cliente?: string): Observable<IResponse<IResponseVisita[]>> {
		const params: string[] = [];
		if (ruta) params.push('ruta=' + encodeURIComponent(ruta));
		if (cliente) params.push('cliente=' + encodeURIComponent(cliente));
		const url = URL_VISITA + (params.length ? '?' + params.join('&') : '');
		return this._httpClient.get<IResponse<IResponseVisita[]>>(url);
	}
	getVisita(ruta: string, cliente: string, inicio: string): Observable<IResponse<IResponseVisita>> {
		const url = this._buildKeyUrl(ruta, cliente, inicio);
		return this._httpClient.get<IResponse<IResponseVisita>>(url);
	}
	createVisita(visita: ICreateVisitaModel): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_VISITA, visita);
	}
	updateVisita(ruta: string, cliente: string, inicio: string, data: ICreateVisitaModel): Observable<IResponse<number>> {
		const url = this._buildKeyUrl(ruta, cliente, inicio);
		return this._httpClient.put<IResponse<number>>(url, data);
	}
	deleteVisita(ruta: string, cliente: string, inicio: string): Observable<IResponse<number>> {
		const url = this._buildKeyUrl(ruta, cliente, inicio);
		return this._httpClient.delete<IResponse<number>>(url);
	}

	private _buildKeyUrl(ruta: string, cliente: string, inicio: string): string {
		return URL_VISITA + '/' + encodeURIComponent(ruta) + '/' + encodeURIComponent(cliente) + '/' + encodeURIComponent(inicio);
	}
}
