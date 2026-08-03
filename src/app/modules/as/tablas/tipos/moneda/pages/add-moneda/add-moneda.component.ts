/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MonedaApiService } from '../../service/moneda-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICreateMonedaModel } from '../../model/moneda-api-model-interface';

@Component({
	selector: 'app-add-moneda',
	templateUrl: './add-moneda.component.html',
	styleUrls: ['./add-moneda.component.scss']
})
export class AddMonedaComponent {
	monedaForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	constructor(
		private _formBuilder: FormBuilder,
		private _monedaApiService: MonedaApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddMonedaComponent>
	) {
		this._loadFormGroup();
	}
	private _loadFormGroup(): void {
		this.monedaForm = this._formBuilder.group({
			codMoneda: ['', [Validators.required, Validators.maxLength(4)]],
			nombre: ['', Validators.required],
			codigoISO: [''],
			activo: ['true']
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.monedaForm.controls['codMoneda'].setValue(this.ediData.codMoneda);
			this.monedaForm.controls['codMoneda'].disable();
			this.monedaForm.controls['nombre'].setValue(this.ediData.nombre);
			this.monedaForm.controls['codigoISO'].setValue(this.ediData.codigoISO);
			this.monedaForm.controls['activo'].setValue(this.ediData.activa);
		}
	}
	clickSave(): void {
		if (this.monedaForm.invalid) {
			return;
		}
		if (!this.ediData) {
			const data: ICreateMonedaModel = {
				codMoneda: this.codMonedaField.value as string,
				nombre: this.nombreField.value as string,
				codigoISO: this.codigoIsoField.value as string,
				activo: this.activoField.value as boolean
			};
			this._save(data);
		} else {
			const data: ICreateMonedaModel = {
				codMoneda: this.codMonedaField.value as string,
				nombre: this.nombreField.value as string,
				codigoISO: this.codigoIsoField.value as string,
				activo: this.activoField.value as boolean
			};
			this._edit(data);
		}
	}
	private _save(moneda: ICreateMonedaModel) {
		this._monedaApiService.createMoneda(moneda).subscribe({
			next: (response) => {
				if (response.success) {
					this.monedaForm.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}

	private _edit(moneda: ICreateMonedaModel) {
		this._monedaApiService.updateMoneda(this.ediData.id as number, moneda).subscribe({
			next: (response) => {
				if (response.success) {
					this.monedaForm.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	get codMonedaField(): AbstractControl {
		return this.monedaForm.get('codMoneda')!;
	}
	get nombreField(): AbstractControl {
		return this.monedaForm.get('nombre')!;
	}
	get codigoIsoField(): AbstractControl {
		return this.monedaForm.get('codigoISO')!;
	}
	get activoField(): AbstractControl {
		return this.monedaForm.get('activo')!;
	}
}
