import { Observable } from 'rxjs';
import { IResponse } from './../../../../../shared/api-models-base-interface';
import { ICrearDocumnetoInvDet } from './../model/documentoInvDet-api-model-interface';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../environments/environment';
import { Injectable } from '@angular/core';

const URL_DOCUMENTOINVDET = environment.host + '/CI/DocumentoInvDet';
@Injectable({
	providedIn: 'root'
})
export class DocumentoInvDetApiService {
	constructor(private _httpClient: HttpClient) {}
	create(documentoInvDet: ICrearDocumnetoInvDet): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_DOCUMENTOINVDET, documentoInvDet);
	}
}
