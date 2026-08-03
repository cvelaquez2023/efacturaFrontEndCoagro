import { ICreateGlobalesCI } from './parametros-ci-api-model-interface';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

const URL_GLOBALESCI = environment.host + '/CI/GlobalesCI';

@Injectable({
	providedIn: 'root'
})
export class ParametrosCIApiService {
	constructor(private _httpClient: HttpClient) {}

	getGlobalesCI(page?: number, rows?: number): Observable<IResponse<ICreateGlobalesCI[]>> {
		let url = URL_GLOBALESCI;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<ICreateGlobalesCI[]>>(url);
	}
	createGlobalesCI(globalesCI: ICreateGlobalesCI): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_GLOBALESCI, globalesCI);
	}
}
