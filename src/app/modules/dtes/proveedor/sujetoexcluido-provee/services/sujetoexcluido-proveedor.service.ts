/* eslint-disable prefer-const */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResponseConsecutivo, IResponseDTE14 } from '../model/sujetoExcluido_DTE_interface';
const URL_CONSECUTIVO = environment.host + '/dte/consecutivo';
const URL_CONSECUTIVO_UPDATE = environment.host + '/dte/consUpdate';
const URL_ENVIAR_SUJETO = environment.host + '/envioMH/dte14';
@Injectable({
	providedIn: 'root'
})
export class SujetoexcluidoProveedorService {
	constructor(private _httpClient: HttpClient) {}
	getConsecutivo(conse: string): Observable<IResponse<IResponseConsecutivo[]>> {
		// eslint-disable-next-line prefer-const
		let url = URL_CONSECUTIVO + '/' + conse;
		return this._httpClient.get<IResponse<IResponseConsecutivo[]>>(url);
	}
	postConsecutivo(conse: string): Observable<IResponse<number>> {
		let url = URL_CONSECUTIVO_UPDATE + '/' + conse;
		return this._httpClient.post<IResponse<number>>(url, conse);
	}
	postEnvioDTE(data: IResponseDTE14): Observable<IResponse<string>> {
		let url = URL_ENVIAR_SUJETO + '/' + '1';
		return this._httpClient.post<IResponse<string>>(url, data);
	}
}
