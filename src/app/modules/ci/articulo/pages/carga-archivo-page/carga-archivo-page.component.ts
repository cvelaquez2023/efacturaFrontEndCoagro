/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticuloApiService } from '../../service/articulo-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-carga-archivo-page',
	templateUrl: './carga-archivo-page.component.html',
	styleUrls: ['./carga-archivo-page.component.scss']
})
export class CargaArchivoPageComponent {
	cobradorForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	file: any;
	constructor(
		private _service: ArticuloApiService,
		private _sonotifyService: SnotifyService,
		private _dialogRef: MatDialogRef<CargaArchivoPageComponent>
	) {}

	getFile(event: any): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this.file = event.target.files[0];
	}

	clickSave(): void {
		this._service.posDts(this.file).subscribe({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			next: (_response) => {
				if (_response.success) {
					//this.cobradorForm.reset();
					this._sonotifyService.info('El Archivo se cargo con exito', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._sonotifyService.error(_response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('eror');
			}
		});
	}
}
