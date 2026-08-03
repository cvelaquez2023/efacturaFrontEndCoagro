/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoImpuestoApiService } from '../../service/tipo-impuesto-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IResponseTipoImpuesto } from '../../models/tipoImpuesto_api_model_interface';

@Component({
	selector: 'app-add-tipo-impuesto',
	templateUrl: './add-tipo-impuesto.component.html',
	styleUrls: ['./add-tipo-impuesto.component.scss']
})
export class AddTipoImpuestoComponent {
	tipoImpuestoForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	constructor(
		private _formBuilder: FormBuilder,
		private _tipoImpuestoApiService: TipoImpuestoApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddTipoImpuestoComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.tipoImpuestoForm = this._formBuilder.group({
			codTipoImpuesto: ['', [Validators.required, Validators.maxLength(10)]],
			nombre: ['', Validators.required],
			activo: [true]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.tipoImpuestoForm.controls['codTipoImpuesto'].setValue(this.ediData.codTipoImpuesto);
			this.tipoImpuestoForm.controls['codTipoImpuesto'].disable();
			this.tipoImpuestoForm.controls['nombre'].setValue(this.ediData.descripcion);
			this.tipoImpuestoForm.controls['activo'].setValue(this.ediData.activo);
		}
	}
	clickSave(): void {
		if (this.tipoImpuestoForm.invalid) {
			console.log('eerrrpr');
			return;
		}
		if (!this.ediData) {
			const data: IResponseTipoImpuesto = {
				codTipoImpuesto: this.codTipoImpuestoField.value as string,
				descripcion: this.nombreField.value as string,
				activo: this.activoField.value as boolean
			};
			this._save(data);
		} else {
			const data: IResponseTipoImpuesto = {
				codTipoImpuesto: this.codTipoImpuestoField.value as string,
				descripcion: this.nombreField.value as string,
				activo: this.activoField.value as boolean
			};
			this._edit(data);
		}
	}
	private _save(data: IResponseTipoImpuesto) {
		this._tipoImpuestoApiService.create(data).subscribe({
			next: (response) => {
				if (response.success) {
					this.tipoImpuestoForm.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	private _edit(data: IResponseTipoImpuesto) {
		this._tipoImpuestoApiService.update(this.ediData.id as number, data).subscribe({
			next: (response) => {
				if (response.success) {
					this.tipoImpuestoForm.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	get codTipoImpuestoField(): AbstractControl {
		return this.tipoImpuestoForm.get('codTipoImpuesto')!;
	}
	get nombreField(): AbstractControl {
		return this.tipoImpuestoForm.get('nombre')!;
	}
	get activoField(): AbstractControl {
		return this.tipoImpuestoForm.get('activo')!;
	}
}
