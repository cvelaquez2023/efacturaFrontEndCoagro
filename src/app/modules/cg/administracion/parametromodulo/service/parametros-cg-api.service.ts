import { IResponse } from './../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ICreateGlobalesCG } from '../model/parametros-cg-api-model-interface';

const URL_GLOBALES_CG = environment.host + '/CG/GlobalCG';
@Injectable({
	providedIn: 'root'
})
export class ParametrosCgApiService {
	constructor(private _httpclient: HttpClient) {}

	getGlobalesCG(): Observable<IResponse<ICreateGlobalesCG[]>> {
		return this._httpclient.get<IResponse<ICreateGlobalesCG[]>>(URL_GLOBALES_CG);
	}
	createGlobalesCG(glabalesCG: ICreateGlobalesCG): Observable<IResponse<number>> {
		return this._httpclient.post<IResponse<number>>(URL_GLOBALES_CG, glabalesCG);
	}
}
