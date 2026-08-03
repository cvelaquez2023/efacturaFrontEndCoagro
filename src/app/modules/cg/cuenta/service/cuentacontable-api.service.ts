import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IRequestCreateCuentaContable, IResponseCuentaContable } from './cuentacontable-api-model-interfaces';
import { IResponse } from '@app/shared/api-models-base-interface';

const URL_CUENTA_CONTABLE = environment.host + '/CG/CuentaContable';
@Injectable({
	providedIn: 'root'
})
export class CuentacontableApiService {
	constructor(private _httpClient: HttpClient) {}
	createCuentaContable(cuentacontable: IRequestCreateCuentaContable): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CUENTA_CONTABLE, cuentacontable);
	}
	getCuentaContable(page?: number, rows?: number): Observable<IResponse<IResponseCuentaContable[]>> {
		let url = URL_CUENTA_CONTABLE;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseCuentaContable[]>>(url);
	}
	updateCuentaContable(
		idCuentaContable: number,
		cuentacontable: IRequestCreateCuentaContable
	): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CUENTA_CONTABLE + '/' + idCuentaContable;
		return this._httpClient.put<IResponse<number>>(url, cuentacontable);
	}
	deleteCuentaContable(idCuentaContable: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CUENTA_CONTABLE + '/' + idCuentaContable;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
