import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse } from '@app/shared/api-models-base-interface';
import { IGlobalesRuteo } from '../model/globales-ruteo-model-interface';

const URL_GLOBALES_RUTEO = environment.host + '/fr/globalesRuteo';

@Injectable({
	providedIn: 'root'
})
export class GlobalesRuteoApiService {
	constructor(private _httpClient: HttpClient) {}

	getGlobalesRuteo(): Observable<IResponse<IGlobalesRuteo>> {
		return this._httpClient.get<IResponse<IGlobalesRuteo>>(URL_GLOBALES_RUTEO);
	}
	createGlobalesRuteo(data: IGlobalesRuteo): Observable<IResponse<IGlobalesRuteo>> {
		return this._httpClient.post<IResponse<IGlobalesRuteo>>(URL_GLOBALES_RUTEO, data);
	}
	updateGlobalesRuteo(data: IGlobalesRuteo): Observable<IResponse<number[]>> {
		return this._httpClient.put<IResponse<number[]>>(URL_GLOBALES_RUTEO, data);
	}
}
