import { IResponse } from "./../shared/api-models-base-interface";
import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpContextToken,
} from "@angular/common/http";
import { catchError, finalize, Observable, throwError, timeout } from "rxjs";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { NgxUiLoaderService } from "ngx-ui-loader";

const REQUEST_TIMEOUT_MS = 20000;

/** Tiempo máximo de espera de una petición; los procesos largos (cargas FR) lo amplían con
 *  `new HttpContext().set(TIEMPO_ESPERA_HTTP, ms)`. */
export const TIEMPO_ESPERA_HTTP = new HttpContextToken<number>(() => REQUEST_TIMEOUT_MS);

/** Peticiones de fondo (p. ej. cientos de búsquedas al subir una plantilla) que NO deben encender el
 *  cargador de pantalla completa: `new HttpContext().set(SIN_CARGADOR, true)`. */
export const SIN_CARGADOR = new HttpContextToken<boolean>(() => false);

@Injectable()
export class ErrorApiInterceptor implements HttpInterceptor {
  constructor(
    private _snotifyService: SnotifyService,
    private _ngxService: NgxUiLoaderService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const conCargador = !request.context.get(SIN_CARGADOR);
    if (conCargador) this._ngxService.start();

    return next.handle(request).pipe(
      timeout(request.context.get(TIEMPO_ESPERA_HTTP)),
      finalize(() => {
        if (conCargador) this._ngxService.stop();
      }),
      catchError((error: unknown) => this._errorHandler(error))
    );
  }
  private _errorHandler(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      this.errorsHttpClient(error);
    } else {
      this._snotifyService.error(
        "No se pudo conectar con el servidor. Verifique su conexión o intente nuevamente.",
        {
          position: SnotifyPosition.rightTop,
        }
      );
    }
    return throwError(() => error);
  }
  private errorsHttpClient(httpErrorResponse: HttpErrorResponse): void {
    switch (httpErrorResponse.status) {
      case 0:
      case 500:
        this._snotifyService.error(
          "Ups,ocurrio un error inesperado, intenta nuevamente.",
          {
            position: SnotifyPosition.rightTop,
          }
        );
        break;
      case 404:
        this._snotifyService.error("No encontramos lo que solicitabas.", {
          position: SnotifyPosition.rightTop,
        });
        break;
      case 401:
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const responseError: IResponse = httpErrorResponse.error;
          if (responseError && responseError.errors) {
            responseError.errors.forEach((message) => {
              this._snotifyService.error(message, "Error", {
                position: SnotifyPosition.rightTop,
              });
            });
          }
        }

        break;
      default:
        break;
    }
  }
}
