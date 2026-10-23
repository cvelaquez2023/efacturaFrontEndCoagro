import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import {
  ICreateRutaConsecutRtModel,
  IResponseRutaConsecutRt,
  IRutaConsecutRtModel,
} from "../model/ruta-consecut-rt-model-interface";

const URL_RUTA_CONSECUT = environment.host + "/fr/rutaConsecutRt";

@Injectable({
  providedIn: "root",
})
export class RutaConsecutRtApiService {
  constructor(private _httpClient: HttpClient) {}

  /** `result` es null cuando la ruta todavía no tiene consecutivos configurados. */
  getRutaConsecutRt(
    ruta: string
  ): Observable<IResponse<IResponseRutaConsecutRt | null>> {
    const url = URL_RUTA_CONSECUT + "/" + encodeURIComponent(ruta);
    return this._httpClient.get<IResponse<IResponseRutaConsecutRt | null>>(
      url
    );
  }
  createRutaConsecutRt(
    data: ICreateRutaConsecutRtModel
  ): Observable<IResponse<IResponseRutaConsecutRt>> {
    return this._httpClient.post<IResponse<IResponseRutaConsecutRt>>(
      URL_RUTA_CONSECUT,
      data
    );
  }
  updateRutaConsecutRt(
    ruta: string,
    data: IRutaConsecutRtModel
  ): Observable<IResponse<number[]>> {
    const url = URL_RUTA_CONSECUT + "/" + encodeURIComponent(ruta);
    return this._httpClient.put<IResponse<number[]>>(url, data);
  }
  deleteRutaConsecutRt(ruta: string): Observable<IResponse<number>> {
    const url = URL_RUTA_CONSECUT + "/" + encodeURIComponent(ruta);
    return this._httpClient.delete<IResponse<number>>(url);
  }
}
