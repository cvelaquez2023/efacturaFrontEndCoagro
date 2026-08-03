import { IResponse } from './../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { ICrearDocumnetoInvEnca } from './../model/documentoInvEnca-api-model-interface';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../environments/environment';
import { Injectable } from '@angular/core';

const URL_DOCUMENTOINVENC = environment.host + '/CI/DocumentoInvEnc';
@Injectable({
	providedIn: 'root'
})
export class DocumentoInvEncaApiService {
	constructor(private _httpClient: HttpClient) {}
	create(documentoInvEnc: ICrearDocumnetoInvEnca): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_DOCUMENTOINVENC, documentoInvEnc);
	}
}
