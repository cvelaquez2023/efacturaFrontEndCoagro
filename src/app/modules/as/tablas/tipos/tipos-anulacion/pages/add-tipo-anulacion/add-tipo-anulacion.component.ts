/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IResponseTipoAnulacion } from './../../models/tipoAnulacion-api-model-interface';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoAnulacionApiService } from '../../Service/tipo-anulacion-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-add-tipo-anulacion',
	templateUrl: './add-tipo-anulacion.component.html',
	styleUrls: ['./add-tipo-anulacion.component.scss']
})
export class AddTipoAnulacionComponent {
	tipoAnulacionForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	constructor(
		private _formBuilder: FormBuilder,
		private _tipoAnulacionApiService: TipoAnulacionApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddTipoAnulacionComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.tipoAnulacionForm = this._formBuilder.group({
			codTipoAnulacion: ['', [Validators.required, Validators.maxLength(10)]],
			nombre: ['', Validators.required],
			activo: [true]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.tipoAnulacionForm.controls['codTipoAnulacion'].setValue(this.ediData.codTipoAnulacion);
			this.tipoAnulacionForm.controls['codTipoAnulacion'].disable();
			this.tipoAnulacionForm.controls['nombre'].setValue(this.ediData.descripcion);
			this.tipoAnulacionForm.controls['activo'].setValue(this.ediData.activo);
		}
	}
	clickSave(): void {
		if (this.tipoAnulacionForm.invalid) {
			console.log('eerrrpr');
			return;
		}
		if (!this.ediData) {
			const data: IResponseTipoAnulacion = {
				codTipoAnulacion: this.codTipoAnulacionField.value as string,
				descripcion: this.nombreField.value as string,
				activo: this.activoField.value as boolean
			};
			this._save(data);
		} else {
			const data: IResponseTipoAnulacion = {
				codTipoAnulacion: this.codTipoAnulacionField.value as string,
				descripcion: this.nombreField.value as string,
				activo: this.activoField.value as boolean
			};
			this._edit(data);
		}
	}
	private _save(data: IResponseTipoAnulacion) {
		this._tipoAnulacionApiService.create(data).subscribe({
			next: (response) => {
				if (response.success) {
					this.tipoAnulacionForm.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	private _edit(data: IResponseTipoAnulacion) {
		this._tipoAnulacionApiService.update(this.ediData.id as number, data).subscribe({
			next: (response) => {
				if (response.success) {
					this.tipoAnulacionForm.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get codTipoAnulacionField(): AbstractControl {
		return this.tipoAnulacionForm.get('codTipoAnulacion')!;
	}
	get nombreField(): AbstractControl {
		return this.tipoAnulacionForm.get('nombre')!;
	}
	get activoField(): AbstractControl {
		return this.tipoAnulacionForm.get('activo')!;
	}
}
