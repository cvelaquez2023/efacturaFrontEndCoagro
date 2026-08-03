import { Router } from '@angular/router';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { SessionStorageService } from '@app/services/local/storage/storage.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	datoUsuario!: any;
	collapsed = false;
	screenWidth = 0;
	constructor(private _router: Router, private _sessionStorageService: SessionStorageService) {}

	ngOnInit(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		this.datoUsuario = this._sessionStorageService.getItem('data_user');
	}
	@Output() toggleSideBarForMe: EventEmitter<unknown> = new EventEmitter();

	toggleSideBar(): void {
		this.toggleSideBarForMe.emit();
	}
	home(): void {
		void this._router.navigateByUrl('/');
	}
	salir(): void {
		this._sessionStorageService.removeItem('data_user');
		void this._router.navigateByUrl('/login');
	}
}
