import { IResponseUsuario } from './usuario-api-model-interface';
import { IResponse } from '@app/shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const URL_USUARIOS = environment.host + '/ERPADMIN/Usuario/Usuarios';
const URL_REGISTER = environment.host + '/ERPADMIN/user/Register';
@Injectable({
	providedIn: 'root'
})
export class UsuarioApiService {
	constructor(private _httpClient: HttpClient) {}
	getAllUser(page?: number, rows?: number): Observable<IResponse<IResponseUsuario[]>> {
		let url = URL_USUARIOS;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseUsuario[]>>(url);
	}
	createUser(user: IResponseUsuario): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_REGISTER, user);
	}
}
