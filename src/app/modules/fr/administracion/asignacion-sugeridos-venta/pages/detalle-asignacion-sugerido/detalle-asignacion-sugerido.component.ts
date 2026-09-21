import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IArticuloSugeridoDetalle, IAsignacionSugeridoFr } from '../../model/asignacion-sugerido-model-interface';

const MOCK_ARTICULOS: IArticuloSugeridoDetalle[] = [
	{ articulo: 'ART001', descripcion: 'Fertilizante Foliar 20L', cantidadAlmacen: 5, cantidadDetalle: 2 },
	{ articulo: 'ART002', descripcion: 'Herbicida Sistemico 1L', cantidadAlmacen: 3, cantidadDetalle: 1 }
];

@Component({
	selector: 'app-detalle-asignacion-sugerido',
	templateUrl: './detalle-asignacion-sugerido.component.html',
	styleUrls: ['./detalle-asignacion-sugerido.component.scss']
})
export class DetalleAsignacionSugeridoComponent {
	asignacionForm!: FormGroup;
	articulos: IArticuloSugeridoDetalle[] = [...MOCK_ARTICULOS];

	constructor(
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public ediData: IAsignacionSugeridoFr,
		private _dialogRef: MatDialogRef<DetalleAsignacionSugeridoComponent>
	) {
		this.asignacionForm = this._formBuilder.group({
			cliente: ['', [Validators.required]],
			sugerido: ['', [Validators.required]]
		});
		if (this.ediData) {
			this.asignacionForm.patchValue(this.ediData);
			this.asignacionForm.controls['cliente'].disable();
		}
	}

	clickSave(): void {
		if (this.asignacionForm.invalid) {
			return;
		}
		const data: IAsignacionSugeridoFr = {
			cliente: this.ediData ? (this.ediData.cliente as string) : (this.clienteField.value as string),
			sugerido: this.sugeridoField.value as string
		};
		this._dialogRef.close(data);
	}

	get clienteField(): AbstractControl {
		return this.asignacionForm.get('cliente')!;
	}
	get sugeridoField(): AbstractControl {
		return this.asignacionForm.get('sugerido')!;
	}
}
