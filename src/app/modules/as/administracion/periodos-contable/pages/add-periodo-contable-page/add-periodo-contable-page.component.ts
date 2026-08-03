/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ContabilidadPipe } from './../../pipe/contabilidad.pipe';
import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PeriodoContableApiService } from '../../services/periodo-contable-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IResponsePeriodosContables } from '../../model/peridoContable-api-model-interface';
import { formatDate } from '@angular/common';

@Component({
	selector: 'app-add-periodo-contable-page',
	templateUrl: './add-periodo-contable-page.component.html',
	styleUrls: ['./add-periodo-contable-page.component.scss']
})
export class AddPeriodoContablePageComponent {
	PeriodosForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	disableSelect = new FormControl(false);
	/**
	 *
	 */
	constructor(
		private _formBuilder: FormBuilder,
		private _peridosContApiService: PeriodoContableApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddPeriodoContablePageComponent>
	) {
		this._loadFormGroup();
	}
	private _loadFormGroup(): void {
		this.PeriodosForm = this._formBuilder.group({
			fechafinal: ['', Validators.required],
			descripcion: ['', Validators.required],
			contabilidad: ['F', Validators.required],
			estado: [true],
			periodoAnual: [false]
		});
		if (this.editData) {
			console.log('edit', this.editData);
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			this.PeriodosForm.controls['fechafinal'].setValue(
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				formatDate(this.editData.fechaFinal, 'dd-MM-yyyy hh:mm:ss', 'en')
			);
			this.PeriodosForm.controls['descripcion'].setValue(this.editData.descripcion);
			this.PeriodosForm.controls['contabilidad'].setValue(this.editData.contabilidad);
		}
	}
	clickSave(): void {
		if (this.PeriodosForm.invalid) {
			return;
		}
		if (!this.editData) {
			const sendData: IResponsePeriodosContables = {
				FechaFinal: this.fechaFinalField.value as Date,
				Descripcion: this.descripcionField.value as string,
				contabilidad: this.contabilidadField.value as string,
				abierto: this.estadoField.value as boolean,
				finPeriodoAnual: this.periodoAnualField.value as boolean
			};
			this._save(sendData);
		} else {
			const sendData: IResponsePeriodosContables = {
				FechaFinal: this.fechaFinalField.value as Date,
				Descripcion: this.descripcionField.value as string,
				contabilidad: this.contabilidadField.value as string,
				abierto: this.estadoField.value as boolean,
				finPeriodoAnual: this.periodoAnualField.value as boolean
			};
			this._edit(sendData);
		}
	}
	private _save(periodo: IResponsePeriodosContables) {
		this._peridosContApiService.createPeriodoContable(periodo).subscribe({
			next: (response) => {
				if (response.success) {
					this.PeriodosForm.reset();
					this._snotifyService.info('El resgisto se guardo sin problema', { position: SnotifyPosition.rightTop });
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

	private _edit(periodo: IResponsePeriodosContables) {
		console.log('edit', periodo);
		this._peridosContApiService.updatePeriodoContable(this.editData.id as number, periodo).subscribe({
			next: (response) => {
				if (response.success) {
					this.PeriodosForm.reset();
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

	get fechaFinalField(): AbstractControl {
		return this.PeriodosForm.get('fechafinal')!;
	}
	get descripcionField(): AbstractControl {
		return this.PeriodosForm.get('descripcion')!;
	}
	get contabilidadField(): AbstractControl {
		return this.PeriodosForm.get('contabilidad')!;
	}
	get estadoField(): AbstractControl {
		return this.PeriodosForm.get('estado')!;
	}
	get periodoAnualField(): AbstractControl {
		return this.PeriodosForm.get('periodoAnual')!;
	}
}
