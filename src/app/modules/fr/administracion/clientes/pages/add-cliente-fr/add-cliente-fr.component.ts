import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { ClienteFrApiService } from '../../service/cliente-fr-api.service';
import { ICreateClienteFrModel, IResponseClienteFr } from '../../model/cliente-fr-model-interface';

@Component({
	selector: 'app-add-cliente-fr',
	templateUrl: './add-cliente-fr.component.html',
	styleUrls: ['./add-cliente-fr.component.scss']
})
export class AddClienteFrComponent {
	clienteForm!: FormGroup;

	constructor(
		private _formBuilder: FormBuilder,
		private _clienteFrApiService: ClienteFrApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: IResponseClienteFr,
		private _dialogRef: MatDialogRef<AddClienteFrComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.clienteForm = this._formBuilder.group({
			cliente: [{ value: this.ediData.CLIENTE, disabled: true }],
			nombre: [this.ediData.NOMBRE, [Validators.required, Validators.maxLength(150)]],
			latitud: [this.ediData.LATITUD],
			longitud: [this.ediData.LONGITUD],
			altitud: [this.ediData.ALTITUD],
			fechaActualizacionUbicacion: [
				this.ediData.FECHA_ACTUALIZACION_UBICACION ? this.ediData.FECHA_ACTUALIZACION_UBICACION.slice(0, 10) : ''
			]
		});
	}

	clickSave(): void {
		if (this.clienteForm.invalid) {
			return;
		}
		const data: ICreateClienteFrModel = {
			cliente: this.ediData.CLIENTE,
			nombre: this.nombreField.value as string,
			latitud: this.latitudField.value as number,
			longitud: this.longitudField.value as number,
			altitud: this.altitudField.value as number,
			fechaActualizacionUbicacion: this.fechaField.value as string
		};
		this._edit(data);
	}

	private _edit(cliente: ICreateClienteFrModel): void {
		this._clienteFrApiService.updateCliente(this.ediData.CLIENTE, cliente).subscribe({
			next: (response) => {
				if (response.success) {
					this.clienteForm.reset();
					this._snotifyService.info('El registro se actualizó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get clienteField(): AbstractControl {
		return this.clienteForm.get('cliente')!;
	}
	get nombreField(): AbstractControl {
		return this.clienteForm.get('nombre')!;
	}
	get latitudField(): AbstractControl {
		return this.clienteForm.get('latitud')!;
	}
	get longitudField(): AbstractControl {
		return this.clienteForm.get('longitud')!;
	}
	get altitudField(): AbstractControl {
		return this.clienteForm.get('altitud')!;
	}
	get fechaField(): AbstractControl {
		return this.clienteForm.get('fechaActualizacionUbicacion')!;
	}
}
