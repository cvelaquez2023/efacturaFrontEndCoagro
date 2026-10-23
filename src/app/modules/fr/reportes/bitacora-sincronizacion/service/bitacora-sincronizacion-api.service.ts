import { Observable, of } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IResponse } from "@app/shared/api-models-base-interface";
import { IBitacoraSincronizacion } from "../../shared/reportes-fr-model-interface";

/** Endpoint previsto para la bitácora. Aún NO existe en el backend (routes/fr/index.js no lo
 *  monta y la sincronización de /fr/sync no deja registro de sus cargas/descargas). */
const URL_BITACORA = environment.host + "/fr/bitacoraSincronizacion";

/**
 * Bitácora de Sincronización (manual FRd pág. 76): cargas y descargas entre las handhelds, las
 * tablas intermedias de FR y el ERP, con su hora de inicio/fin y estado.
 *
 * Pendiente backend: mientras `BACKEND_DISPONIBLE` sea false no se hace la llamada HTTP (evita el
 * 404 y su toast de error) y se devuelve una lista vacía; la pantalla lo indica. Cuando exista el
 * endpoint (GET ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD, respuesta IBitacoraSincronizacion[]) basta
 * con poner la bandera en true.
 */
@Injectable({
  providedIn: "root",
})
export class BitacoraSincronizacionApiService {
  static readonly BACKEND_DISPONIBLE: boolean = false;

  constructor(private _httpClient: HttpClient) {}

  getBitacora(
    desde: string,
    hasta: string
  ): Observable<IResponse<IBitacoraSincronizacion[]>> {
    if (!BitacoraSincronizacionApiService.BACKEND_DISPONIBLE) {
      return of({ success: true, errors: [], result: [] });
    }
    const params = new HttpParams().set("desde", desde).set("hasta", hasta);
    return this._httpClient.get<IResponse<IBitacoraSincronizacion[]>>(
      URL_BITACORA,
      { params }
    );
  }
}
