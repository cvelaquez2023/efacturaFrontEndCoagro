import { IResponseClasificacion, ICreateClasificacion } from './../../services/clasificacion-api-model-interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { ClasificacionApiService } from './../../services/clasificacion-api.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
	selector: 'app-add-clasificaciones-page',
	templateUrl: './add-clasificaciones-page.component.html',
	styleUrls: ['./add-clasificaciones-page.component.scss']
})
export class AddClasificacionesPageComponent {
	claForm!: FormGroup;
	actionBtn = 'Guardar';
	constructor(
		private _formBuilder: FormBuilder,
		private _clasificacionApiService: ClasificacionApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddClasificacionesPageComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.claForm = this._formBuilder.group({
			codClasificacion: ['', Validators.required],
			descripcion: ['', Validators.required]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.claForm.controls['codClasificacion'].setValue(this.editData.codClasificacion);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.claForm.controls['descripcion'].setValue(this.editData.descripcion);
		}
	}
	clickSave(): void {
		if (this.claForm.invalid) {
			return;
		}
		if (!this.editData) {
			const sendDatos: ICreateClasificacion = {
				codClasificacion: this.codClasificacionField.value as string,
				descripcion: this.descripcionField.value as string,
				agrupacion: this.agrupacionField.value as string,
				usaNumeroSerire: this.usaNumeroSerieField.value as boolean,
				plantillaSerie: this.plantillaSerieField.value as string,
				aporteCodigo: this.aporteCodigoField.value as string,
				tipoCodigobarra: this.tipoCodigoBarraField.value as string,
				unidadMedidadId: this.unidadMedidaField.value as number
			};
			this._save(sendDatos);
		} else {
			const sendDatos: ICreateClasificacion = {
				codClasificacion: this.codClasificacionField.value as string,
				descripcion: this.descripcionField.value as string,
				agrupacion: this.agrupacionField.value as string,
				usaNumeroSerire: this.usaNumeroSerieField.value as boolean,
				plantillaSerie: this.plantillaSerieField.value as string,
				aporteCodigo: this.aporteCodigoField.value as string,
				tipoCodigobarra: this.tipoCodigoBarraField.value as string,
				unidadMedidadId: this.unidadMedidaField.value as number
			};
			this._edit(sendDatos);
		}
	}
	private _save(clasificacion: ICreateClasificacion) {
		this._clasificacionApiService.createClasifi(clasificacion).subscribe({
			next: (response) => {
				console.log(response);

				if (response.success) {
					this.claForm.reset();
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private _edit(clasificacion: ICreateClasificacion) {
		console.log('actualizar');
		this.claForm.reset();
		this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
		this._dialogRef.close('update');
	}

	get codClasificacionField(): AbstractControl {
		return this.claForm.get('codClasificacion')!;
	}
	get descripcionField(): AbstractControl {
		return this.claForm.get('descripcion')!;
	}
	get agrupacionField(): AbstractControl {
		return this.claForm.get('agrupacion')!;
	}
	get usaNumeroSerieField(): AbstractControl {
		return this.claForm.get('usaNUmeroSerie')!;
	}
	get plantillaSerieField(): AbstractControl {
		return this.claForm.get('plantillaSerie')!;
	}
	get aporteCodigoField(): AbstractControl {
		return this.claForm.get('aporteCodigo')!;
	}
	get tipoCodigoBarraField(): AbstractControl {
		return this.claForm.get('tipoCodigoBarra')!;
	}
	get unidadMedidaField(): AbstractControl {
		return this.claForm.get('unidadMedida')!;
	}
}
