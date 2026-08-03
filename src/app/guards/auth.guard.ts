import { PATHS_AUTH_PAGES } from './../config/path-pages';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DataUserService } from '@app/services/local/data-user.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private _dataUserService: DataUserService, private _router: Router) {}
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return this._validaSession();
	}
	private _validaSession(): boolean {
		const isExpiredToken = this._dataUserService.isExpiredToken();
		if (isExpiredToken) {
			void this._router.navigateByUrl(PATHS_AUTH_PAGES.LoginPage.withSlash);
			return false;
		}
		return true;
	}
}
