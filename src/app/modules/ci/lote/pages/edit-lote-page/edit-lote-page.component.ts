import { IResponseLote } from './../../model/lote-interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
	selector: 'app-edit-lote-page',
	templateUrl: './edit-lote-page.component.html',
	styleUrls: ['./edit-lote-page.component.scss']
})
export class EditLotePageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,

		@Inject(MAT_DIALOG_DATA) public editData: IResponseLote,
		private _dialogRef: MatDialogRef<EditLotePageComponent>
	) {
		this._loadFormulario();
	}

	ngOnInit(): void {
		// transforma el objeto date a una fecha de tipo string
		console.log('aquii');
	}
	formLote!: FormGroup;
	item!: any;
	currDate!: any;
	private _loadFormulario(): void {
		this.formLote = this._formBuilder.group({
			lote: [''],
			perecedero: [false],
			articulo: [''],
			descripcion: [''],
			proveedor: [''],
			nomproveedor: [''],
			loteprov: [''],
			cantidad: [''],
			fechaEntrada: [''],
			fechaCuarentena: [''],
			fechaVencimiento: [''],
			estado: [''],
			ingreso: ['']
		});
		this.formLote.controls['lote'].setValue(this.editData.codLote);
		this.formLote.controls['lote'].disable();
		this.formLote.controls['perecedero'].setValue(this.editData.articulo.perecedero);
		this.formLote.controls['perecedero'].disable();
		this.formLote.controls['articulo'].setValue(this.editData.articulo.codArticulo);
		this.formLote.controls['articulo'].disable();
		this.formLote.controls['descripcion'].setValue(this.editData.articulo.descripcion);
		this.formLote.controls['descripcion'].disable();
		this.formLote.controls['loteprov'].setValue(this.editData.loteProveedor);
		this.formLote.controls['cantidad'].setValue(this.editData.cantidadIngresada);
		this.formLote.controls['cantidad'].disable();
		this.formLote.controls['fechaEntrada'].setValue(this.editData.fechaEntrada);
		this.formLote.controls['fechaEntrada'].disable();
		this.formLote.controls['fechaCuarentena'].setValue(this.editData.fechaCuarentena);
		this.formLote.controls['fechaCuarentena'].disable();
		this.formLote.controls['fechaVencimiento'].setValue(this.editData.fechaVencimiento);

		this.formLote.controls['estado'].setValue(this.editData.estado);
		this.formLote.controls['estado'].disable();
		this.formLote.controls['ingreso'].setValue(this.editData.tipoIngreso);
	}
	adicionar(): void {
		console.log('guardar');
	}
}
