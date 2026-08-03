/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { error } from 'console';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClienteDteApiService } from '@app/modules/dtes/cliente/service/cliente-dte-api.service';

@Component({
	selector: 'app-crear-invalidacion-page',
	templateUrl: './crear-invalidacion-page.component.html',
	styleUrls: ['./crear-invalidacion-page.component.scss']
})
export class CrearInvalidacionPageComponent {
	vendedorForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = true;
	fechaanula = '';
	monto = 0;
	constructor(
		private _formBuilder: FormBuilder,
		private _servcio: ClienteDteApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<CrearInvalidacionPageComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.vendedorForm = this._formBuilder.group({
			dte: [''],
			cliente: [''],
			nombre: [''],
			codigogeneracion: [''],
			monto: [''],
			fechaanula: [''],
			personaResponsable: ['', Validators.required],
			tipoDocResponsable: ['', Validators.required],
			docResponsable: ['', Validators.required],
			personaSolicita: ['', Validators.required],
			tipoDocSolicita: ['', Validators.required],
			docSolicita: ['', Validators.required],
			motivo: ['', Validators.required]
		});
		if (this.ediData) {
			this.actionBtn = 'Enviar';

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['dte'].setValue(this.ediData.documento);
			this.vendedorForm.controls['codigogeneracion'].setValue(this.ediData.codigoGeneracion);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['cliente'].setValue(this.ediData.cliente_origen);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['nombre'].setValue(this.ediData.nombre);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['monto'].setValue(this.ediData.monto);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['fechaanula'].setValue(this.ediData.fecha_anulacion);
			this.fechaanula = this.ediData.fecha_anulacion;
			this.monto = this.ediData.monto;
		}
	}
	clickSave(): void {
		if (this.vendedorForm.invalid) {
			return;
		}
		const datos = {
			empresa_id: 1,
			documento: this.dteField.value as string,
			tipoAnulacion: 2,
			motivoAnulacion: this.motivoField.value as string,
			nombreResponsable: this.personaResponsableField.value as string,
			tipoDocResponsable: this.tipoDocResponsableField.value as string,
			numDocResponsable: this.docResponsableField.value as string,
			nombreSolicita: this.personaSolicitaField.value as string,
			numDocSolicita: this.docSolicitaField.value as string,
			tipoDocSolicita: this.tipoDocSolicitaField.value as string
		};
		this._servcio.postDteCreateInvalidacion(datos).subscribe({
			next: (response) => {
				if (response.success) {
					this.vendedorForm.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},

			error: (error) => {
				console.log('error', error);
			}
		});
	}

	get dteField(): AbstractControl {
		return this.vendedorForm.get('dte')!;
	}
	get clienteField(): AbstractControl {
		return this.vendedorForm.get('cliente')!;
	}
	get nombreField(): AbstractControl {
		return this.vendedorForm.get('nombre')!;
	}
	get codigogeneracionField(): AbstractControl {
		return this.vendedorForm.get('codigogeneracion')!;
	}
	get montoField(): AbstractControl {
		return this.vendedorForm.get('monto')!;
	}
	get fechaanulaField(): AbstractControl {
		return this.vendedorForm.get('fechaanula')!;
	}
	get personaResponsableField(): AbstractControl {
		return this.vendedorForm.get('personaResponsable')!;
	}

	get tipoDocResponsableField(): AbstractControl {
		return this.vendedorForm.get('tipoDocResponsable')!;
	}
	get docResponsableField(): AbstractControl {
		return this.vendedorForm.get('docResponsable')!;
	}

	get personaSolicitaField(): AbstractControl {
		return this.vendedorForm.get('personaSolicita')!;
	}
	get tipoDocSolicitaField(): AbstractControl {
		return this.vendedorForm.get('tipoDocSolicita')!;
	}
	get docSolicitaField(): AbstractControl {
		return this.vendedorForm.get('docSolicita')!;
	}
	get motivoField(): AbstractControl {
		return this.vendedorForm.get('motivo')!;
	}
}
