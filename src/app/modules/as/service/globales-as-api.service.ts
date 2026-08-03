/* eslint-disable prefer-const */
import { Iglobales_AS } from './../model/Globales_AS.interface';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';

const URL_GLOBALES_AS = environment.host + '/AS/GlobalesAS';

@Injectable({
	providedIn: 'root'
})
export class GlobalesASApiService {
	constructor(private _httpClient: HttpClient) {}
	getGlobalesAS(): Observable<IResponse<Iglobales_AS[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		let url = URL_GLOBALES_AS;
		return this._httpClient.get<IResponse<Iglobales_AS[]>>(url);
	}
	createGlobalesAS(globalesAS: Iglobales_AS): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_GLOBALES_AS, globalesAS);
	}
}
