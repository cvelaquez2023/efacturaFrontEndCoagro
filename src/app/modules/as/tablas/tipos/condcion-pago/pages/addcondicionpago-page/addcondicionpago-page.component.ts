/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import {
	ICondicionPagoEdit,
	ICondicionPagoCreate,
	ICondicionPagoConsulta
} from './../../models/condicionPago-api-model-interface';
import { CondicionPagoApiService } from './../../service/condicionPago-api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
	selector: 'app-addcondicionpago-page',
	templateUrl: './addcondicionpago-page.component.html',
	styleUrls: ['./addcondicionpago-page.component.scss']
})
export class AddcondicionpagoPageComponent {
	constructor(
		private _dialogRef: MatDialogRef<AddcondicionpagoPageComponent>,
		private _formBuilder: FormBuilder,
		private _condicionPagoApiService: CondicionPagoApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public editData: ICondicionPagoConsulta
	) {
		this._loadFormGroup();
	}
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	codicionPagoForm!: FormGroup;

	clickSave(): void {
		if (this.codicionPagoForm.invalid) {
			return;
		}
		if (!this.editData) {
			const sendDatos: ICondicionPagoCreate = {
				codCondicionPago: this.codCondicionPagoField.value as string,
				descripcion: this.descripcionField.value as string,
				diasNeto: this.diasNetoField.value as number,
				descuentoContado: this.descuentoContadoField.value as number,
				plazoCondPago: this.plazoField.value as number,
				pagosParciales: this.permitePlanPagoField.value as boolean,
				tipoCondPago: 'NO',
				activa: true
			};
			this._save(sendDatos);
		} else {
			const sendDatos: ICondicionPagoEdit = {
				codCondicionPago: this.codCondicionPagoField.value as string,
				descripcion: this.descripcionField.value as string,
				diasNeto: this.diasNetoField.value as number,
				descuentoContado: this.descuentoContadoField.value as number,
				plazoCondPago: this.plazoField.value as number,
				pagosParciales: this.permitePlanPagoField.value as boolean,
				tipoCondPago: 'NO',
				activa: true
			};
			this._edit(sendDatos);
		}
	}

	private _save(datos: ICondicionPagoCreate) {
		this._condicionPagoApiService.createCondicionPago(datos).subscribe({
			next: (response) => {
				if (response.success) {
					this.codicionPagoForm.reset();
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
	private _edit(datos: ICondicionPagoEdit) {
		this._condicionPagoApiService.updateCondicionPago(this.editData.id, datos).subscribe({
			next: (response) => {
				console.log(response);
				if (response.success) {
					this.codicionPagoForm.reset();
					this._snotifyService.info('El Registro de Actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('edit');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					this._dialogRef.close('edit');
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	private _loadFormGroup(): void {
		const numericNumberReg = '^-?[0-9]\\d*(\\.\\d{1,2})?$';
		this.codicionPagoForm = this._formBuilder.group({
			codCondicionPago: ['', [Validators.required, Validators.maxLength(4)]],
			descripcion: ['', [Validators.required, Validators.maxLength(40)]],
			diasNeto: ['30', [Validators.required, Validators.maxLength(40)]],
			descuentoContado: ['0', [Validators.required, Validators.min(0), Validators.pattern(numericNumberReg)]],
			permitePlanPagos: [false],

			plazo: ['0']
		});
		if (this.editData) {
			this.actionBtn = 'Editar';
			this.codicionPagoForm.controls['codCondicionPago'].setValue(this.editData.codCondicionPago);
			this.codicionPagoForm.controls['codCondicionPago'].disable();
			this.codicionPagoForm.controls['descripcion'].setValue(this.editData.descripcion);
			this.codicionPagoForm.controls['diasNeto'].setValue(this.editData.diasNeto);
			this.codicionPagoForm.controls['descuentoContado'].setValue(this.editData.descuentoContado);
			this.codicionPagoForm.controls['permitePlanPagos'].setValue(this.editData.pagosParciales);
			this.codicionPagoForm.controls['plazo'].setValue(this.editData.plazoCondPago);
		}
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	filtro(event: any): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		var tecla = event.key;
		if (['.', ','].includes(tecla)) {
			event.preventDefault();
		}
	}
	get codCondicionPagoField(): AbstractControl {
		return this.codicionPagoForm.get('codCondicionPago')!;
	}
	get descripcionField(): AbstractControl {
		return this.codicionPagoForm.get('descripcion')!;
	}
	get diasNetoField(): AbstractControl {
		return this.codicionPagoForm.get('diasNeto')!;
	}
	get descuentoContadoField(): AbstractControl {
		return this.codicionPagoForm.get('descuentoContado')!;
	}
	get permitePlanPagoField(): AbstractControl {
		return this.codicionPagoForm.get('permitePlanPagos')!;
	}
	get plazoField(): AbstractControl {
		return this.codicionPagoForm.get('plazo')!;
	}
}
