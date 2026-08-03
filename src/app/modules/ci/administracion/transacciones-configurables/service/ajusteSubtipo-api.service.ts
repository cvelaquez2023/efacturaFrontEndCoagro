/* eslint-disable prefer-const */
import { IResponseAjusteSubTipo } from './../model/ajusteSubTipo-model-interface';
import { Observable } from 'rxjs';
import { environment } from './../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';

const URL_AJUSTESUBTIPO = environment.host + '/CI/AjusteSubTipo';
@Injectable({
	providedIn: 'root'
})
export class AjusteSubtipoApiService {
	constructor(private _httpClient: HttpClient) {}
	getAjusteSubTipo(): Observable<IResponse<IResponseAjusteSubTipo[]>> {
		let url = URL_AJUSTESUBTIPO;
		return this._httpClient.get<IResponse<IResponseAjusteSubTipo[]>>(url);
	}
}
