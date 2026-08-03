import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Iglobales_CI } from '../model/globales_CI.interface';
const URL_GLOBALES_CI = environment.host + '/CI/GlobalesCI';
@Injectable({
	providedIn: 'root'
})
export class GlobalesCIApiService {
	constructor(private _httpClient: HttpClient) {}
	getGlobalesCI(page?: number, rows?: number): Observable<IResponse<Iglobales_CI[]>> {
		let url = URL_GLOBALES_CI;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<Iglobales_CI[]>>(url);
	}
}
