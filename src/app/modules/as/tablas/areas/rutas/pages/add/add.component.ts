/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IRequestCreateRuta } from './../../services/ruta-api-model-interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { RutaApiService } from './../../services/ruta-api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent {
	rutaForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = false;
	constructor(
		private _formBuilder: FormBuilder,
		private _rutaApiService: RutaApiService,
		private _sonotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddComponent>
	) {
		this._loadFormGroup();
	}
	private _loadFormGroup(): void {
		this.rutaForm = this._formBuilder.group({
			codRuta: ['', [Validators.required, Validators.maxLength(4)]],
			descripcion: ['', Validators.required],
			activa: [true, Validators.required]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.rutaForm.controls['codRuta'].setValue(this.editData.codRuta);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.rutaForm.controls['descripcion'].setValue(this.editData.descripcion);
			this.rutaForm.controls['activa'].setValue(this.editData.activa);
		}
	}
	clickSave(): void {
		if (this.rutaForm.invalid) {
			return;
		}
		if (!this.editData) {
			const sendRuta: IRequestCreateRuta = {
				codRuta: this.codRutaField.value as string,
				descripcion: this.descriocionField.value as string,
				activa: this.activoField.value as boolean
			};

			this._save(sendRuta);
		} else {
			const sendRuta: IRequestCreateRuta = {
				codRuta: this.codRutaField.value as string,
				descripcion: this.descriocionField.value as string,
				activa: this.activoField.value as boolean
			};
			this._edit(sendRuta);
		}
	}

	private _save(ruta: IRequestCreateRuta) {
		this._rutaApiService.createRuta(ruta).subscribe({
			next: (response) => {
				if (response.success) {
					this.rutaForm.reset();
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

	private _edit(ruta: IRequestCreateRuta) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		console.log(ruta);
		this._rutaApiService.update(this.editData.id as number, ruta).subscribe({
			next: (response) => {
				if (response.success) {
					this.rutaForm.reset();
					this._sonotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('edit');
				} else {
					this._sonotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}

	get codRutaField(): AbstractControl {
		return this.rutaForm.get('codRuta')!;
	}
	get descriocionField(): AbstractControl {
		return this.rutaForm.get('descripcion')!;
	}
	get activoField(): AbstractControl {
		return this.rutaForm.get('activa')!;
	}
}
