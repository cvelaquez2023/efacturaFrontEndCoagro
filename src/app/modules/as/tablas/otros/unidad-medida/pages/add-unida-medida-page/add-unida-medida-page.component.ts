/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ICreateUnidadMedida } from './../../service/unidad-medida-api-model-interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { UnidadMedidaApiService } from './../../service/unidad-medida-api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, Inject } from '@angular/core';

@Component({
	selector: 'app-add-unida-medida-page',
	templateUrl: './add-unida-medida-page.component.html',
	styleUrls: ['./add-unida-medida-page.component.scss']
})
export class AddUnidaMedidaPageComponent {
	f!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn = 'Guardar';

	constructor(
		private _formBuilder: FormBuilder,
		private _unidadMedidaApiService: UnidadMedidaApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddUnidaMedidaPageComponent>
	) {
		this._loadFormGroup();
	}
	private _loadFormGroup(): void {
		this.f = this._formBuilder.group({
			codUnidadMedida: ['', [Validators.required, Validators.maxLength(4)]],
			descripcion: ['', [Validators.required, Validators.maxLength(25)]]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.f.controls['codUnidadMedida'].setValue(this.editData.codUnidadMedida);
			this.f.controls['codUnidadMedida'].disable();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.f.controls['descripcion'].setValue(this.editData.descripcion);
		}
	}

	clickSave(): void {
		if (this.f.invalid) {
			return;
		}

		if (!this.editData) {
			const sendData: ICreateUnidadMedida = {
				codUnidadMedida: this.codUnidadMedidaField.value as string,
				descripcion: this.descripcionField.value as string
			};
			this._save(sendData);
		} else {
			const sendBodega: ICreateUnidadMedida = {
				codUnidadMedida: this.codUnidadMedidaField.value as string,
				descripcion: this.descripcionField.value as string
			};
			this._edit(sendBodega);
		}
	}

	private _save(unidadMedida: ICreateUnidadMedida) {
		this._unidadMedidaApiService.crearBodega(unidadMedida).subscribe({
			next: (response) => {
				if (response.success) {
					this.f.reset();
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
	private _edit(unidadMedida: ICreateUnidadMedida) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this._unidadMedidaApiService.update(this.editData.id, unidadMedida).subscribe({
			next: (response) => {
				this.f.reset();
				this._snotifyService.info('El registro de actualizo sin problema', { position: SnotifyPosition.rightTop });
				this._dialogRef.close('update');
			},
			error: () => {
				console.log('error');
			}
		});
	}

	get codUnidadMedidaField(): AbstractControl {
		return this.f.get('codUnidadMedida')!;
	}
	get descripcionField(): AbstractControl {
		return this.f.get('descripcion')!;
	}
}
