import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ICreateGlobalesAS } from '../../services/parametros-as-api-model-interface';

const URL_GLOBALESAS = environment.host + '/AS/GlobalesAS';

@Injectable({
	providedIn: 'root'
})
export class ParametrosASApiService {
	constructor(private _httpClient: HttpClient) {}
	getGlobalesAS(): Observable<IResponse<ICreateGlobalesAS[]>> {
		return this._httpClient.get<IResponse<ICreateGlobalesAS[]>>(URL_GLOBALESAS);
	}
	createGlobalesAS(globalesAS: ICreateGlobalesAS): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_GLOBALESAS, globalesAS);
	}
}
