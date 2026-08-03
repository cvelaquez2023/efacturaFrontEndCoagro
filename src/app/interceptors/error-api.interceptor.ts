import { IResponse } from './../shared/api-models-base-interface';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable()
export class ErrorApiInterceptor implements HttpInterceptor {
	constructor(private _snotifyService: SnotifyService, private _ngxService: NgxUiLoaderService) {}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		this._ngxService.start();

		return next.handle(request).pipe(
			finalize(() => {
				this._ngxService.stop();
			}),
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			catchError((error) => this._errorHandler(error))
		);
	}
	private _errorHandler(error: HttpErrorResponse): Observable<never> {
		this.errorsHttpClient(error);
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
