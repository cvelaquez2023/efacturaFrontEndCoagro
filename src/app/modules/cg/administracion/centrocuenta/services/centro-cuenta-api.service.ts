import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResponseCentroCuenta } from '../model/centroCuenta-api-model-interface';
import { IResponse } from '@app/shared/api-models-base-interface';

const URL_CENTROCUENTA = environment.host + '/CG/CentroCuenta';

@Injectable({
	providedIn: 'root'
})
export class CentroCuentaApiService {
	constructor(private _httpClient: HttpClient) {}
	getCentroCuenta(page?: number, rows?: number): Observable<IResponse<IResponseCentroCuenta[]>> {
		let url = URL_CENTROCUENTA;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCentroCuenta[]>>(url);
	}
}
