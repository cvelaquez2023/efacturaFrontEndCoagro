/* eslint-disable no-self-assign */
import { IConsultaPaqueteInvApiModel, ICreatePaqueteInv } from './../model/paqueteInv-api-model-interface';
import { IConsultaDocumnetoInvEnca } from './../model/documentoInvEnca-api-model-interface';
import { IResponse } from './../../../../../shared/api-models-base-interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../../environments/environment';
import { Injectable } from '@angular/core';

const URL_DOCUMENTOINVENC = environment.host + '/CI/DocumentoInvEnc';
//const URL_DOCUMENTOINVDET = environment.host + '/CI/DocumentoInvDet';
const URL_PAQUETEINV = environment.host + '/CI/PaqueteInv';
@Injectable({
	providedIn: 'root'
})
export class PaqueteciApiService {
	constructor(private _hhtpClient: HttpClient) {}
	getDocumnetoInvEnc(): Observable<IResponse<IConsultaDocumnetoInvEnca[]>> {
		let url = URL_DOCUMENTOINVENC;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url;
		return this._hhtpClient.get<IResponse<IConsultaDocumnetoInvEnca[]>>(url);
	}
	getPaqueteInv(page?: number, rows?: number): Observable<IResponse<IConsultaPaqueteInvApiModel[]>> {
		let url = URL_PAQUETEINV;
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		url = url + '?page=' + page + '&rows=' + rows;
		return this._hhtpClient.get<IResponse<IConsultaPaqueteInvApiModel[]>>(url);
	}
	createPaquete(paquete: ICreatePaqueteInv): Observable<IResponse<number>> {
		return this._hhtpClient.post<IResponse<number>>(URL_PAQUETEINV, paquete);
	}
}
