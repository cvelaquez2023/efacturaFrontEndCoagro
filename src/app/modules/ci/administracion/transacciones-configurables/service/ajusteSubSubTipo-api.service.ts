/* eslint-disable prefer-const */
import { IResponse } from './../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../environments/environment';
import { Injectable } from '@angular/core';
import { IResponseAjusteSubSubTipo } from '../model/ajusteSubSubTipo-model-interface';

const URL_AJUSTESUBSUBTIPO = environment.host + '/CI/AjusteSubSubTipo';
@Injectable({
	providedIn: 'root'
})
export class AjusteSubSubTipoApiService {
	constructor(private _httpClient: HttpClient) {}
	getAjusteSubSubTipo(): Observable<IResponse<IResponseAjusteSubSubTipo[]>> {
		let url = URL_AJUSTESUBSUBTIPO;
		return this._httpClient.get<IResponse<IResponseAjusteSubSubTipo[]>>(url);
	}
}
