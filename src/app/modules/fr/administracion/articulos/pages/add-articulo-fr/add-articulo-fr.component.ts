import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { ArticuloFrApiService } from '../../service/articulo-fr-api.service';
import { ICreateArticuloFrModel, IResponseArticuloFr } from '../../model/articulo-fr-model-interface';

@Component({
	selector: 'app-add-articulo-fr',
	templateUrl: './add-articulo-fr.component.html',
	styleUrls: ['./add-articulo-fr.component.scss']
})
export class AddArticuloFrComponent {
	articuloForm!: FormGroup;

	constructor(
		private _formBuilder: FormBuilder,
		private _articuloFrApiService: ArticuloFrApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: IResponseArticuloFr,
		private _dialogRef: MatDialogRef<AddArticuloFrComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.articuloForm = this._formBuilder.group({
			articulo: [{ value: this.ediData.ARTICULO, disabled: true }],
			descripcion: [this.ediData.DESCRIPCION, [Validators.required, Validators.maxLength(254)]],
			factorPrecio: [this.ediData.FACTOR_PRECIO],
			ordenArticulo: [this.ediData.ORDEN_ARTICULO],
			bodega: [this.ediData.BODEGA],
			localizacion: [this.ediData.LOCALIZACION]
		});
	}

	clickSave(): void {
		if (this.articuloForm.invalid) {
			return;
		}
		const data: ICreateArticuloFrModel = {
			articulo: this.ediData.ARTICULO,
			descripcion: this.descripcionField.value as string,
			factorPrecio: this.factorPrecioField.value as number,
			ordenArticulo: this.ordenArticuloField.value as string,
			bodega: this.bodegaField.value as string,
			localizacion: this.localizacionField.value as string
		};
		this._articuloFrApiService.updateArticulo(this.ediData.ARTICULO, data).subscribe({
			next: (response) => {
				if (response.success) {
					this._snotifyService.info('El registro se actualizó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get descripcionField(): AbstractControl {
		return this.articuloForm.get('descripcion')!;
	}
	get factorPrecioField(): AbstractControl {
		return this.articuloForm.get('factorPrecio')!;
	}
	get ordenArticuloField(): AbstractControl {
		return this.articuloForm.get('ordenArticulo')!;
	}
	get bodegaField(): AbstractControl {
		return this.articuloForm.get('bodega')!;
	}
	get localizacionField(): AbstractControl {
		return this.articuloForm.get('localizacion')!;
	}
}
