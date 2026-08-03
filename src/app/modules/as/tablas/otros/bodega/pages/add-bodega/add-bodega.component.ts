import { IResponseBodega, IResponseCreateBodega } from './../../service/bodega-api-model-interface';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { BodegaApiService } from './../../service/bodega-api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
	selector: 'app-add-bodega',
	templateUrl: './add-bodega.component.html',
	styleUrls: ['./add-bodega.component.scss']
})
export class AddBodegaComponent {
	bodegaForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	floatLabelControl = new FormControl('V');
	constructor(
		private _formBuilder: FormBuilder,
		private _bodegaApiService: BodegaApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddBodegaComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.bodegaForm = this._formBuilder.group({
			codBodega: ['', [Validators.required, Validators.maxLength(4)]],
			nombre: ['', [Validators.required]],
			tipo: ['', Validators.required],
			activa: [true, Validators.required],
			telefono: ['', Validators.required],
			direccion: ['', Validators.required]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';

			this.bodegaForm.controls['codBodega'].setValue(this.editData.codBodega);
			this.bodegaForm.controls['codBodega'].disable();
			this.bodegaForm.controls['nombre'].setValue(this.editData.nombre);
			this.bodegaForm.controls['tipo'].setValue(this.editData.tipo);
			this.bodegaForm.controls['activa'].setValue(this.editData.activa);
			this.bodegaForm.controls['telefono'].setValue(this.editData.telefono);
			this.bodegaForm.controls['direccion'].setValue(this.editData.direccion);
		}
	}
	clickSave(): void {
		if (this.bodegaForm.invalid) {
			return;
		}

		if (!this.editData) {
			const sendBodega: IResponseCreateBodega = {
				codBodega: this.codBodegaField.value as string,
				nombre: this.nombreField.value as string,
				tipo: this.tipoField.value as string,
				activa: this.activoFiel.value as boolean,
				telefono: this.telefonoField.value as string,
				direccion: this.direccionField.value as string
			};
			this._save(sendBodega);
		} else {
			const sendBodega: IResponseCreateBodega = {
				codBodega: this.codBodegaField.value as string,
				nombre: this.nombreField.value as string,
				tipo: this.tipoField.value as string,
				activa: this.activoFiel.value as boolean,
				telefono: this.telefonoField.value as string,
				direccion: this.direccionField.value as string
			};
			this._edit(sendBodega);
		}
	}
	private _save(bodega: IResponseCreateBodega) {
		this._bodegaApiService.crearBodega(bodega).subscribe({
			next: (response) => {
				if (response.success) {
					this.bodegaForm.reset();
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
	private _edit(bodega: IResponseCreateBodega) {
		this._bodegaApiService.update(this.editData.id as number, bodega).subscribe({
			next: (response) => {
				this.bodegaForm.reset();
				this._snotifyService.info('El registro de actualizo sin problema', { position: SnotifyPosition.rightTop });
				this._dialogRef.close('update');
			},
			error: () => {
				console.log('error');
			}
		});
	}
	get codBodegaField(): AbstractControl {
		return this.bodegaForm.get('codBodega')!;
	}
	get nombreField(): AbstractControl {
		return this.bodegaForm.get('nombre')!;
	}
	get tipoField(): AbstractControl {
		return this.bodegaForm.get('tipo')!;
	}
	get activoFiel(): AbstractControl {
		return this.bodegaForm.get('activa')!;
	}
	get telefonoField(): AbstractControl {
		return this.bodegaForm.get('telefono')!;
	}
	get direccionField(): AbstractControl {
		return this.bodegaForm.get('direccion')!;
	}
}
