import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { DataUserService } from '@app/services/local/data-user.service';
import { URL_LOGIN, URL_REGISTER } from '../modules/auth/services/api/user-api.service';

const EXPEMPTED_URLS = [URL_LOGIN, URL_REGISTER];

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
	constructor(private _dataUser: DataUserService, private _router: Router) {}
	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		if (this.isExempted(request.url)) {
			return next.handle(request);
		}

		if (this._dataUser.isExpiredToken()) {
			void this._router.navigateByUrl('/');
			EMPTY;
		}

		const token = this._dataUser.getToken();
		const requestClone = request.clone({
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			headers: request.headers.set('Authorization', `Bearer ${token}`)
		});

		return next.handle(requestClone);
	}

	private isExempted(url: string): boolean {
		const exist = EXPEMPTED_URLS.find((item) => item === url);
		return exist != undefined;
	}
}
