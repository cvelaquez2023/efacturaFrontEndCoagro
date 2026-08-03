import {
	IResponseConsecutivoCi,
	IResponseConsInvAjCon,
	IResponseConsUsuario,
	ICreateConsInvAjCon
} from './../model/IResponseConsecutivoCi';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';

const URL_CONSECUTIVOCI = environment.host + '/CI/ConsecutivoInv';
const URL_CONSINVAJUSTE = environment.host + '/CI/ConsInvAjConfig';
const URL_CONSUSUARIO = environment.host + '/CI/ConsecutivoInvUsuario';
@Injectable({
	providedIn: 'root'
})
export class ConsecutivoApiService {
	constructor(private _httpClient: HttpClient) {}
	getConsecutivoCI(page?: number, rows?: number): Observable<IResponse<IResponseConsecutivoCi[]>> {
		let url = URL_CONSECUTIVOCI;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._httpClient.get<IResponse<IResponseConsecutivoCi[]>>(url);
	}
	createConsecutivoCI(consecutivoCI: IResponseConsecutivoCi): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CONSECUTIVOCI, consecutivoCI);
	}
	delete(idConsecutivoCI: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CONSECUTIVOCI + '/' + idConsecutivoCI;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	getConsInvAjuste(): Observable<IResponse<IResponseConsInvAjCon[]>> {
		const url = URL_CONSINVAJUSTE;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		return this._httpClient.get<IResponse<IResponseConsInvAjCon[]>>(url);
	}
	createConsInvAjuste(consInvAjuste: ICreateConsInvAjCon): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_CONSINVAJUSTE, consInvAjuste);
	}
	deleteConstInvAjuste(id: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CONSINVAJUSTE + '/' + id;
		return this._httpClient.delete<IResponse<number>>(url);
	}

	getConsUsuario(): Observable<IResponse<IResponseConsUsuario[]>> {
		const url = URL_CONSUSUARIO;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		return this._httpClient.get<IResponse<IResponseConsUsuario[]>>(url);
	}
}
