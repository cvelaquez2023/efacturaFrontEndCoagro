import { IResponse } from './../shared/api-models-base-interface';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, throwError, timeout } from 'rxjs';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { NgxUiLoaderService } from 'ngx-ui-loader';

const REQUEST_TIMEOUT_MS = 20000;

@Injectable()
export class ErrorApiInterceptor implements HttpInterceptor {
	constructor(private _snotifyService: SnotifyService, private _ngxService: NgxUiLoaderService) {}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		this._ngxService.start();

		return next.handle(request).pipe(
			timeout(REQUEST_TIMEOUT_MS),
			finalize(() => {
				this._ngxService.stop();
			}),
			catchError((error: unknown) => this._errorHandler(error))
		);
	}
	private _errorHandler(error: unknown): Observable<never> {
		if (error instanceof HttpErrorResponse) {
			this.errorsHttpClient(error);
		} else {
			this._snotifyService.error('No se pudo conectar con el servidor. Verifique su conexión o intente nuevamente.', {
				position: SnotifyPosition.rightTop
			});
		}
		return throwError(() => error);
	}
	private errorsHttpClient(httpErrorResponse: HttpErrorResponse): void {
		switch (httpErrorResponse.status) {
			case 0:
			case 500:
				this._snotifyService.error('Ups,ocurrio un error inesperado, intenta nuevamente.', {
					position: SnotifyPosition.rightTop
				});
				break;
			case 404:
				this._snotifyService.error('No encontramos lo que solicitabas.', {
					position: SnotifyPosition.rightTop
				});
				break;
			case 401:
				{
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const responseError: IResponse = httpErrorResponse.error;
					if (responseError && responseError.errors) {
						responseError.errors.forEach((message) => {
							this._snotifyService.error(message, 'Error', {
								position: SnotifyPosition.rightTop
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
