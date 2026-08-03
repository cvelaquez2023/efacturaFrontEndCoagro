import { environment } from './../../../../../environments/environment.prod';

import { IResponse } from './../../../../shared/api-models-base-interface';
import {
	IRequestLogin,
	IRequestRegister,
	IResponseLogin,
	IRequestResetPassword,
	IRequestChangePassword,
	IResponseConjunto,
	IResponseListarUsuario,
	IRequestGuardarUser
} from './user-api-model-interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export const URL_LOGIN = environment.host + '/auth/login';
export const URL_REGISTER = environment.host + '/ERPADMIN/Usuario/Register';
export const URL_CONJUNTO = environment.host + '/ERPADMIN/Usuario/Conjunto';
const URL_SEND_TOKEN_RESET_PASSWORD = environment.host + '/ERPADMIN/Usuario/SendTokenToResetPassword';
const URL_RESET_PASSWORD = environment.host + '/ERPADMIN/Usuario/ResetPassword';
const URL_CHANGE_PASSWORD = environment.host + '/ERPMADIN/Usuario/ChangePassword';
const URL_USER_LIST = environment.host + '/auth/listarUsuario';
const URL_USER_REGISTER = environment.host + '/auth/register';
@Injectable({
	providedIn: 'root'
})
export class UserApiService {
	constructor(private _httpClient: HttpClient) {}
	getListarUsuario(): Observable<IResponse<IResponseListarUsuario[]>> {
		return this._httpClient.get<IResponse<IResponseListarUsuario[]>>(URL_USER_LIST);
	}

	login(login: IRequestLogin): Observable<IResponse<IResponseLogin>> {
		// eslint-disable-next-line prefer-const
		let url = URL_LOGIN;

		return this._httpClient.post<IResponse<IResponseLogin>>(url, login);
	}
	conjunto(email?: string, conjuntoId?: string): Observable<IResponse<IResponseConjunto[]>> {
		let url = URL_CONJUNTO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?userid=' + email + '&conjuntoId=' + conjuntoId;

		return this._httpClient.get<IResponse<IResponseConjunto[]>>(url);
	}

	register(request: IRequestRegister): Observable<IResponse<string>> {
		return this._httpClient.post<IResponse<string>>(URL_REGISTER, request);
	}
	postUsuario(data: IRequestGuardarUser): Observable<IResponse<string>> {
		return this._httpClient.post<IResponse<string>>(URL_USER_REGISTER, data);
	}
	sendTokenToResestPassword(email: string): Observable<IResponse<string>> {
		return this._httpClient.post<IResponse<string>>(URL_SEND_TOKEN_RESET_PASSWORD, { email });
	}
	resetPassword(request: IRequestResetPassword): Observable<IResponse<string>> {
		return this._httpClient.post<IResponse<string>>(URL_RESET_PASSWORD, request);
	}
	changePassword(request: IRequestChangePassword): Observable<IResponse> {
		return this._httpClient.post<IResponse>(URL_CHANGE_PASSWORD, request);
	}
}
