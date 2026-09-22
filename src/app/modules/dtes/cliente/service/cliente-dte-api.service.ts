import { IResponse } from "./../../../../shared/api-models-base-interface";
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  IResponseCliente,
  IResponseCrearInvalidacion,
  IResponseDteInvalidaciones,
  IResponseDteObser,
  IResponseDtes,
  IResponseEnvioMail,
  IResponseReimpresion,
  ITicketPdf,
} from "@app/modules/ci/articulo/model/articulo-api-model-interface";

import { environment } from "src/environments/environment";

const URL_DTE = environment.host + "/dte/cliente";
const URL_DTE_IMPRESION = environment.host + "/dte/descargar";
const URL_DTE_OBSER = environment.host + "/dte/observaciones";
const URL_DTE_FACTURA = environment.host + "/facturas";
const URL_DTE_CREAR_INVA = environment.host + "/envioMH/invalidacion";
const URL_DTE_CLIENTE = environment.host + "/dte/clientes";
const URL_DTE_PROVEEDOR = environment.host + "/dte/proveedor";
const URL_DTE_ANULACIO = environment.host + "/documentos/anulados";
const URL_DTE_ENVIO = environment.host + "/envioMH";
const URL_ENVIO_MAIL = environment.host + "/envioMH/envioMail";
const URL_REIMPRIMIR_PDF = environment.host + "/envioMH/reimprimir";
const URL_IMPRIMIR_TICKET = environment.host + "/envioMH/ticketpdf";

@Injectable({
  providedIn: "root",
})
export class ClienteDteApiService {
  constructor(private _httpCliente: HttpClient) {}
  getDte(ano: string, mes: string): Observable<IResponse<IResponseDtes[]>> {
    const url = URL_DTE + "/" + ano + "/" + mes;
    return this._httpCliente.get<IResponse<IResponseDtes[]>>(url);
  }
  getProveedor(
    ano: string,
    mes: string,
    tipo: string
  ): Observable<IResponse<IResponseDtes[]>> {
    const url = URL_DTE_PROVEEDOR + "/" + ano + "/" + mes + "/" + tipo;
    return this._httpCliente.get<IResponse<IResponseDtes[]>>(url);
  }
  getCliente(dte: string): Observable<IResponse<IResponseCliente[]>> {
    const url = URL_DTE_CLIENTE + "/" + dte;
    return this._httpCliente.get<IResponse<IResponseCliente[]>>(url);
  }

  getDteDescargar(dte: string) {
    const url = URL_DTE_IMPRESION + "/" + dte;
    return this._httpCliente.get(url, {
      observe: "response",
      responseType: "blob",
    });
  }

  getDteInvalidaciones(
    ano: string,
    mes: string
  ): Observable<IResponse<IResponseDteInvalidaciones[]>> {
    const url = URL_DTE_ANULACIO + "/" + ano + "/" + mes;
    return this._httpCliente.get<IResponse<IResponseDteInvalidaciones[]>>(url);
  }
  getDteObservaciones(
    dteId: number
  ): Observable<IResponse<IResponseDteObser[]>> {
    const url = URL_DTE_OBSER + "/" + dteId;
    return this._httpCliente.get<IResponse<IResponseDteObser[]>>(url);
  }
  postEnvioEmail(datos: IResponseEnvioMail): Observable<IResponse<number>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._httpCliente.post<IResponse<number>>(URL_ENVIO_MAIL, datos);
  }
  posReimprimirPdf(data: IResponseReimpresion): Observable<IResponse<number>> {
    const url = URL_REIMPRIMIR_PDF;
    return this._httpCliente.post<IResponse<number>>(url, data);
  }
  posticketPdf(id: number): Observable<IResponse<ITicketPdf[]>> {
    const url = URL_IMPRIMIR_TICKET + "/" + id;
    return this._httpCliente.get<IResponse<ITicketPdf[]>>(url);
  }
  postDteCreateInvalidacion(
    datos: IResponseCrearInvalidacion
  ): Observable<IResponse<number>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._httpCliente.post<IResponse<number>>(URL_DTE_CREAR_INVA, datos);
  }
  postDteMh(dte: string, id: number): Observable<IResponse<number>> {
    const tipo = "dte" + dte.substring(4, 6);

    const url = URL_DTE_ENVIO + "/" + tipo + "/" + dte + "/" + id;
    return this._httpCliente.post<IResponse<number>>(url, dte);
  }
}
