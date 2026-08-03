import { IResponse } from './../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { ICreateMovInventario } from './../model/paqueteInv-api-model-interface';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../environments/environment';
import { Injectable } from '@angular/core';

const URL_MOVINVENTARIO = environment.host + '/CI/MovInventarioEnc';
@Injectable({
	providedIn: 'root'
})
export class MovInventarioApiService {
	constructor(private _httpClient: HttpClient) {}
	create(documento: ICreateMovInventario): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_MOVINVENTARIO, documento);
	}
}
