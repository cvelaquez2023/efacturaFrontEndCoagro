import { ICreateAjsutesConfig } from './../../consecutivos/model/IResponseConsecutivoCi';
import { IResponse } from '@app/shared/api-models-base-interface';
import { IResponseTransConfigurable } from './../model/transConfigurable-model-interface';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

const URL_AJSUTECONFIG = environment.host + '/CI/AjusteConfig';

@Injectable({
	providedIn: 'root'
})
export class TransConfigurableApiService {
	constructor(private _httpClient: HttpClient) {}
	getTranConfig(page?: number, rows?: number): Observable<IResponse<IResponseTransConfigurable[]>> {
		let url = URL_AJSUTECONFIG;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseTransConfigurable[]>>(url);
	}
	createAjusteConfif(ajusteConfig: ICreateAjsutesConfig): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_AJSUTECONFIG, ajusteConfig);
	}
}
