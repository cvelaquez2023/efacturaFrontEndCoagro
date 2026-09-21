import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IDevolucionFr, ILineaArticuloDevolucion } from '../../model/devolucion-fr-model-interface';

const MOCK_LINEAS: ILineaArticuloDevolucion[] = [
	{ articulo: 'ART001', descripcion: 'Fertilizante Foliar 20L', cantidad: 2, lote: '' },
	{ articulo: 'ART002', descripcion: 'Herbicida Sistemico 1L', cantidad: 1, lote: '' }
];

@Component({
	selector: 'app-definir-lote-devolucion',
	templateUrl: './definir-lote-devolucion.component.html',
	styleUrls: ['./definir-lote-devolucion.component.scss']
})
export class DefinirLoteDevolucionComponent {
	loteForm!: FormGroup;
	lineas: ILineaArticuloDevolucion[] = MOCK_LINEAS;

	constructor(
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public ediData: IDevolucionFr,
		private _dialogRef: MatDialogRef<DefinirLoteDevolucionComponent>
	) {
		this.loteForm = this._formBuilder.group({
			lote: [this.ediData.lote || '', [Validators.required, Validators.maxLength(20)]]
		});
	}

	clickSave(): void {
		if (this.loteForm.invalid) {
			return;
		}
		const data: IDevolucionFr = { ...this.ediData, lote: this.loteField.value as string };
		this._dialogRef.close(data);
	}

	get loteField(): AbstractControl {
		return this.loteForm.get('lote')!;
	}
}
