import { IRequestCreateCobrador } from './../../services/cobrador-api-model-interface';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CobradorApiService } from './../../services/cobrador-api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, Inject } from '@angular/core';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent {
	cobradorForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	constructor(
		private _formBuilder: FormBuilder,
		private _cobradorApiService: CobradorApiService,
		private _sonotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddComponent>
	) {
		this._loadFormGroup();
	}
	private _loadFormGroup(): void {
		this.cobradorForm = this._formBuilder.group({
			codCobrador: ['', [Validators.required, Validators.maxLength(4)]],
			nombre: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			activo: [true, Validators.required]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.cobradorForm.controls['codCobrador'].setValue(this.ediData.codCobrador);
			this.cobradorForm.controls['codCobrador'].disable();
			this.cobradorForm.controls['nombre'].setValue(this.ediData.nombre);
			this.cobradorForm.controls['email'].setValue(this.ediData.email);
			this.cobradorForm.controls['activo'].setValue(this.ediData.activo);
		}
	}
	clickSave(): void {
		if (this.cobradorForm.invalid) {
			return;
		}
		if (!this.ediData) {
			const sendCobrador: IRequestCreateCobrador = {
				codCobrador: this.codCobradorField.value as string,
				nombre: this.nombreField.value as string,
				email: this.emailField.value as string,
				activo: this.activoField.value as boolean
			};

			this._save(sendCobrador);
		} else {
			const sendCobrador: IRequestCreateCobrador = {
				codCobrador: this.codCobradorField.value as string,
				nombre: this.nombreField.value as string,
				email: this.emailField.value as string,
				activo: this.activoField.value as boolean
			};
			this._edit(sendCobrador);
		}
	}

	private _save(cobrador: IRequestCreateCobrador) {
		this._cobradorApiService.createCobrador(cobrador).subscribe({
			next: (response) => {
				if (response.success) {
					this.cobradorForm.reset();
					this._sonotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._sonotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},

			error: () => {
				console.log('error');
			}
		});
	}
	private _edit(cobrador: IRequestCreateCobrador) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this._cobradorApiService.update(this.ediData.id as number, cobrador).subscribe({
			next: (response) => {
				if (response.success) {
					this.cobradorForm.reset();
					this._sonotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
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

	get codCobradorField(): AbstractControl {
		return this.cobradorForm.get('codCobrador')!;
	}
	get nombreField(): AbstractControl {
		return this.cobradorForm.get('nombre')!;
	}
	get emailField(): AbstractControl {
		return this.cobradorForm.get('email')!;
	}
	get activoField(): AbstractControl {
		return this.cobradorForm.get('activo')!;
	}
}
