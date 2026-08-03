/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BodegaApiService } from './../../service/bodega-api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
	selector: 'app-localizacion-page',
	templateUrl: './localizacion-page.component.html',
	styleUrls: ['./localizacion-page.component.scss']
})
export class LocalizacionPageComponent implements OnInit {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	constructor(private _bodegaApiService: BodegaApiService, @Inject(MAT_DIALOG_DATA) public editData: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		console.log(this.editData.id);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this._loadLocalizacion(this.editData.id);
	}

	ngOnInit(): void {
		console.log('nada');
	}

	private _loadLocalizacion(localizacion: number): void {
		this._bodegaApiService.getBodegaLocalizacion(localizacion).subscribe({
			next: (response) => {
				console.log(response);
			},
			error: () => {
				console.log('erro');
			}
		});
	}
}
