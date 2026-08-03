/* eslint-disable prefer-const */
import { IResponseLote } from './../model/lote-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
const URL_LOTE = environment.host + '/CI/Lote';
@Injectable({
	providedIn: 'root'
})
export class LoteApiService {
	constructor(private _httpClient: HttpClient) {}
	getLote(): Observable<IResponse<IResponseLote[]>> {
		let url = URL_LOTE;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseLote[]>>(url);
	}
	deleteLote(idLote: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_LOTE + '/' + idLote;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	//Falta el update
}
