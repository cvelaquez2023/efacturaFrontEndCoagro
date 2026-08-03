/* eslint-disable prefer-const */
import { IResponseExistenciaLote } from './../model/existenciaLote-interface';
import { IResponse } from './../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { environment } from './../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const URL_EXISTENCIALOTE = environment.host + '/CI/ExistenciaLote';
@Injectable({
	providedIn: 'root'
})
export class ExistenciaLoteApiService {
	constructor(private _HttpClient: HttpClient) {}
	getexitenicaLote(): Observable<IResponse<IResponseExistenciaLote[]>> {
		let url = URL_EXISTENCIALOTE;
		return this._HttpClient.get<IResponse<IResponseExistenciaLote[]>>(url);
	}
}
