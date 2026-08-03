/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../environments/environment';
import { Injectable } from '@angular/core';
import { IResponse } from '@app/shared/api-models-base-interface';
import {
	IRequestCreateArticulo,
	IResponseAsientoLinea,
	IResponseBeneficiario,
	IResponseCajaChica,
	IResponseCentroCosto,
	IResponseCentroCuenta,
	IResponseConceptoVale,
	IResponseCondPago,
	IResponseDepartamento,
	IResponseDtes,
	IResponseDtesCp,
	IResponseMoneda,
	IResponseSubTipo,
	IResponseVale,
	IResponseValeCajachica
} from '../model/articulo-api-model-interface';
import { IResponseTipoImpuesto } from '@app/modules/as/tablas/tipos/tipo-impuesto/models/tipoImpuesto_api_model_interface';

const URL_ARTICULO = environment.host + '/dte';
const URL_DTE = environment.host + '/dte/cp';
const URL_IMPUESTO = environment.host + '/impuesto';
const URL_MONEDA = environment.host + '/moneda';
const URL_CONDPAGO = environment.host + '/condicionpago';
const URL_TIPODOC = environment.host + '/subtipocp';
const URL_DOC_CP = environment.host + '/documentos_cp';
const URL_CENTRO_COSTO = environment.host + '/centroCosto';
const URL_CUENTA_CONTABLE = environment.host + '/cuentacontable';
const URL_CENTRO_CUENTA2 = environment.host + '/centroCuenta/cuenta';
const URL_CENTRO_CUENTA = environment.host + '/centroCuenta/costo';
const URL_DIARIO = environment.host + '/diario';
const URL_DIARIO_LINEA = environment.host + '/diario/lineas';

const URL_CAJA_CHICA = environment.host + '/cajachica';
const URL_DEPARTAMENTO = environment.host + '/departamento';
const URL_CCONCEPTO = environment.host + '/conceptovale';
const URL_BENEFICIARIO = environment.host + '/empleado';

const URL_VALE = environment.host + '/vale';
const URL_DOCSOPORTE = environment.host + '/docuSoporte';
const URL_DOCSOPORTE_DTE14 = environment.host + '/docuSoporte/dte14';
const URL_VALE_CAJACHICA = environment.host + '/vale';

@Injectable({
	providedIn: 'root'
})
export class ArticuloApiService {
	constructor(private _httpClient: HttpClient) {}
	getArticulo(): Observable<IResponse<IResponseDtes[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseDtes[]>>(URL_ARTICULO);
	}
	getCentroCosto(): Observable<IResponse<IResponseCentroCosto[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseCentroCosto[]>>(URL_CENTRO_COSTO);
	}
	getCuentaContable(): Observable<IResponse<IResponseCentroCuenta[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseCentroCuenta[]>>(URL_CUENTA_CONTABLE);
	}
	getCentroCuenta(id: string): Observable<IResponse<IResponseCentroCuenta[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CENTRO_CUENTA + '/' + id;
		return this._httpClient.get<IResponse<IResponseCentroCuenta[]>>(url);
	}
	getCentroCuenta2(id: string): Observable<IResponse<IResponseCentroCosto[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_CENTRO_CUENTA2 + '/' + id;
		return this._httpClient.get<IResponse<IResponseCentroCosto[]>>(url);
	}
	getImpuestos(): Observable<IResponse<IResponseTipoImpuesto[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseTipoImpuesto[]>>(URL_IMPUESTO);
	}
	getCondicionPagos(): Observable<IResponse<IResponseCondPago[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseCondPago[]>>(URL_CONDPAGO);
	}
	getMoneda(): Observable<IResponse<IResponseMoneda[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands

		return this._httpClient.get<IResponse<IResponseMoneda[]>>(URL_MONEDA);
	}
	getSubTipoCp(id: string): Observable<IResponse<IResponseSubTipo[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_TIPODOC + '/' + id;
		return this._httpClient.get<IResponse<IResponseSubTipo[]>>(url);
	}
	getDteCp(id: number): Observable<IResponse<IResponseDtesCp[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_DTE + '/' + id;
		return this._httpClient.get<IResponse<IResponseDtesCp[]>>(url);
	}
	getAsiento(asiento: string): Observable<IResponse<IResponseAsientoLinea[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_DIARIO + '/' + asiento;
		return this._httpClient.get<IResponse<IResponseAsientoLinea[]>>(url);
	}

	getCajaChica(): Observable<IResponse<IResponseCajaChica[]>> {
		return this._httpClient.get<IResponse<IResponseCajaChica[]>>(URL_CAJA_CHICA);
	}

	getDepartamento(): Observable<IResponse<IResponseDepartamento[]>> {
		return this._httpClient.get<IResponse<IResponseDepartamento[]>>(URL_DEPARTAMENTO);
	}
	getConcepto(): Observable<IResponse<IResponseConceptoVale[]>> {
		return this._httpClient.get<IResponse<IResponseConceptoVale[]>>(URL_CCONCEPTO);
	}
	getBeneficiario(): Observable<IResponse<IResponseBeneficiario[]>> {
		return this._httpClient.get<IResponse<IResponseBeneficiario[]>>(URL_BENEFICIARIO);
	}
	getVale(cajachica: string): Observable<IResponse<IResponseValeCajachica[]>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_VALE_CAJACHICA + '/' + cajachica;
		return this._httpClient.get<IResponse<IResponseValeCajachica[]>>(url);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posDts(dtes: any): Observable<IResponse<any>> {
		return this._httpClient.post<IResponse<number>>(URL_ARTICULO, dtes);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posDiario(asiento: any): Observable<IResponse<any>> {
		return this._httpClient.post<IResponse<number>>(URL_DIARIO, asiento);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posDiarioLinea(asiento: any): Observable<IResponse<any>> {
		return this._httpClient.post<IResponse<number>>(URL_DIARIO_LINEA, asiento);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posDocCp(documento: any): Observable<IResponse<IResponseAsientoLinea[]>> {
		return this._httpClient.post<IResponse<IResponseAsientoLinea[]>>(URL_DOC_CP, documento);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posVale(documento: any): Observable<IResponse<IResponseVale[]>> {
		return this._httpClient.post<IResponse<IResponseVale[]>>(URL_VALE, documento);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posDocSoporte(documento: any): Observable<IResponse<any>> {
		return this._httpClient.post<IResponse<number>>(URL_DOCSOPORTE, documento);
	}
	posDocSoporte14(documento: any): Observable<IResponse<any>> {
		return this._httpClient.post<IResponse<number>>(URL_DOCSOPORTE_DTE14, documento);
	}
	putDts(idDte: number, selloRecibido: string): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_ARTICULO + '/' + idDte + '/' + selloRecibido;
		return this._httpClient.put<IResponse<number>>(url, selloRecibido);
	}
	createArticulo(articulo: IRequestCreateArticulo): Observable<IResponse<number>> {
		return this._httpClient.post<IResponse<number>>(URL_ARTICULO, articulo);
	}
	deleteArticulo(idArticulo: number): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_ARTICULO + '/' + idArticulo;
		return this._httpClient.delete<IResponse<number>>(url);
	}
	deleteAsientoLinea(cons: number, asineto: string): Observable<IResponse<number>> {
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		const url = URL_DIARIO + '/' + cons + '/' + asineto;
		return this._httpClient.delete<IResponse<number>>(url);
	}
}
