import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse } from '@app/shared/api-models-base-interface';
import { ICreateHandheldModel, IResponseHandheld } from '../model/handheld-fr-model-interface';

const URL_HANDHELD = environment.host + '/fr/handheldRt';

@Injectable({
	providedIn: 'root'
})
export class HandheldApiService {
	constructor(private _httpClient: HttpClient) {}

	getHandhelds(estado?: string): Observable<IResponse<IResponseHandheld[]>> {
		const url = URL_HANDHELD + (estado ? '?estado=' + encodeURIComponent(estado) : '');
		return this._httpClient.get<IResponse<IResponseHandheld[]>>(url);
	}
	createHandheld(handheld: ICreateHandheldModel): Observable<IResponse<IResponseHandheld>> {
		return this._httpClient.post<IResponse<IResponseHandheld>>(URL_HANDHELD, handheld);
	}
	updateHandheld(handheld: string, data: ICreateHandheldModel): Observable<IResponse<number>> {
		const url = URL_HANDHELD + '/' + encodeURIComponent(handheld);
		return this._httpClient.put<IResponse<number>>(url, data);
	}
	deleteHandheld(handheld: string): Observable<IResponse<number>> {
		const url = URL_HANDHELD + '/' + encodeURIComponent(handheld);
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
