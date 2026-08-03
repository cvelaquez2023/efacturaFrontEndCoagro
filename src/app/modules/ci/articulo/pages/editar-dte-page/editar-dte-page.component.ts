/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { ArticuloApiService } from '../../service/articulo-api.service';

@Component({
	selector: 'app-editar-dte-page',
	templateUrl: './editar-dte-page.component.html',
	styleUrls: ['./editar-dte-page.component.scss']
})
export class EditarDtePageComponent {
	dteForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	constructor(
		private _formBuider: FormBuilder,
		private _sonotifyService: SnotifyService,
		private _service: ArticuloApiService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<EditarDtePageComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.dteForm = this._formBuider.group({
			codCobrador: ['', [Validators.required, Validators.min(40)]],
			nombre: [],
			email: [],
			activo: [true]
		});
		console.log('data', this.ediData);
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.dteForm.controls['codCobrador'].setValue(this.ediData.selloRecibido);
		}
	}

	clickSave(): void {
		if (this.dteForm.invalid) {
			return;
		} else {
			this._service.putDts(this.ediData.Dte_Id as number, this.codCobradorField.value as string).subscribe({
				next: (response) => {
					if (response.success) {
						this._sonotifyService.info('El registro se actualizo sin problema', {
							position: SnotifyPosition.rightTop
						});
						this._dialogRef.close('update');
					} else {
						this._sonotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					}
				},
				error: () => {
					console.log('error');
				}
			});
		}
	}
	get codCobradorField(): AbstractControl {
		return this.dteForm.get('codCobrador')!;
	}
}
