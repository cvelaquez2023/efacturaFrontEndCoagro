import { IRequestCreateVendedor } from './../../services/vendedor-api-model-interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { VendedorApiService } from './../../services/vendedor-api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, Inject } from '@angular/core';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent {
	vendedorForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = true;
	constructor(
		private _formBuilder: FormBuilder,
		private _vendedorApiService: VendedorApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddComponent>
	) {
		this._loadFormGroup();
	}
	private _loadFormGroup(): void {
		this.vendedorForm = this._formBuilder.group({
			codVendedor: ['', [Validators.required, Validators.maxLength(4)]],
			nombre: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			activo: [true, Validators.required]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['codVendedor'].setValue(this.ediData.codVendedor);
			this.vendedorForm.controls['codVendedor'].disable();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['nombre'].setValue(this.ediData.nombre);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['email'].setValue(this.ediData.email);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.vendedorForm.controls['activo'].setValue(this.ediData.activo);
		}
	}
	clickSave(): void {
		if (this.vendedorForm.invalid) {
			return;
		}
		if (!this.ediData) {
			const sendCobrador: IRequestCreateVendedor = {
				codVendedor: this.codVendedorField.value as string,
				nombre: this.nombreField.value as string,
				email: this.emailField.value as string,
				activo: this.activoField.value as boolean
			};

			this._save(sendCobrador);
		} else {
			const sendCobrador: IRequestCreateVendedor = {
				codVendedor: this.codVendedorField.value as string,
				nombre: this.nombreField.value as string,
				email: this.emailField.value as string,
				activo: this.activoField.value as boolean
			};
			this._edit(sendCobrador);
		}
	}
	private _save(vendedor: IRequestCreateVendedor) {
		this._vendedorApiService.createVendedor(vendedor).subscribe({
			next: (response) => {
				if (response.success) {
					this.vendedorForm.reset();
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
	private _edit(vendedor: IRequestCreateVendedor) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this._vendedorApiService.update(this.ediData.id as number, vendedor).subscribe({
			next: (response) => {
				if (response.success) {
					this.vendedorForm.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('edit');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	}

	get codVendedorField(): AbstractControl {
		return this.vendedorForm.get('codVendedor')!;
	}
	get nombreField(): AbstractControl {
		return this.vendedorForm.get('nombre')!;
	}
	get emailField(): AbstractControl {
		return this.vendedorForm.get('email')!;
	}
	get activoField(): AbstractControl {
		return this.vendedorForm.get('activo')!;
	}
}
