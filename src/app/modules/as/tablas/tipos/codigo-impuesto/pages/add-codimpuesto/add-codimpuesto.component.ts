/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AbstractControl } from '@angular/forms';
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImpuestoApiService } from '../../service/impuesto-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';

import { ICreateImpuesto } from '../../model/impuesto-model';
import { CentroCuentaApiService } from '@app/modules/cg/administracion/centrocuenta/services/centro-cuenta-api.service';
import { IResponseCentroCuenta } from '@app/modules/cg/administracion/centrocuenta/model/centroCuenta-api-model-interface';

@Component({
	selector: 'app-add-codimpuesto',
	templateUrl: './add-codimpuesto.component.html',
	styleUrls: ['./add-codimpuesto.component.scss']
})
export class AddCodimpuestoComponent implements OnInit {
	constructor(
		private _dialogRef: MatDialogRef<AddCodimpuestoComponent>,
		private _formBuilder: FormBuilder,
		private _codigoImpuestoApiService: ImpuestoApiService,
		private _centroCuentaApiService: CentroCuentaApiService,
		private _snotifyservice: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any
	) {
		this._loadCentroCuenta(1, 10000);
		this._loadFormulario();
	}
	actionBtn: string = 'Guardar';
	codImpuestoForm!: FormGroup;
	disableButtonSave: false | undefined;
	checked = false;
	disabled = false;
	disabledDev = false;
	disabledDev2 = false;
	indeterminate = false;
	formCodigoImpuesto!: FormGroup;
	labelPosition: 'before' | 'after' = 'after';
	listCentroCuenta: IResponseCentroCuenta[] = [];
	private _loadCentroCuenta(page: number, rows: number): void {
		this._centroCuentaApiService.getCentroCuenta(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCentroCuenta = response.result;
				} else {
					this._snotifyservice.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	ngOnInit(): void {
		console.log(this.disabled);
	}
	onclick(): void {
		if (this.formCodigoImpuesto.invalid) {
			return;
		}
		if (!this.editData) {
			const data: ICreateImpuesto = {
				CodImpuesto: this.codigoField.value as string,
				Descripcion: this.descripcionField.value as string,
				Activo: this.activoField.value as boolean,
				//Impuesto1
				TipoContabImp1: this.tipoContabImp1Field.value as string,
				ContabDevImp1: this.contDevImp1Field.value as string,
				Impuesto1: this.impuesto1Field.value as number,
				TipoImpuesto1: this.tipoImpuestoField.value as string,
				CtrCtaImp1Id: this.ctrCtaImp1IdField.value as number,
				CtrCtaImp1GenVtsId: this.ctrCtaImp1GenVtsIdField.value as number,
				CtrCtaImp1DesCompId: this.ctrCtaImp1DesCompIdField.value as number,
				CtrCtaImp1DevCompId: this.ctrCtaImp1DevCompIdField.value as number,
				CtrCtaImp1DevVentasId: this.ctrCtaImp1DevCompIdField.value as number,
				//Impuesto2
				TipoContabImp2: this.tipoContabImp2Field.value as string,
				ContabDevImp2: this.contDevImp2Field.value as string,
				UsaImpuesto2Cantidad: this.usaImp2CantidadField.value as string,
				Impuesto2: this.impuesto2Field.value as number,
				CalculoImp2: this.calculoImp2Field.value as string,
				CtrCtaImp2Id: this.ctrCtaImp2IdField.value as number,
				CtrCtaImp2GenVtsId: this.ctrCtaImp2GenVtsIdField.value as number,
				CtrCtaImp2DesCompId: this.ctrCtaImp2DesCompIdField.value as number,
				CtrCtaImp2DevCompId: this.ctrCtaImp2DevCompIdField.value as number,
				CtrCtaImp2DevVentasId: this.ctrCtaImp2DevVentasIdField.value as number,
				Impuesto2Cantidad: 0.0
			};
			this._save(data);
		} else {
			const data: ICreateImpuesto = {
				CodImpuesto: this.codigoField.value as string,
				Descripcion: this.descripcionField.value as string,
				Activo: this.activoField.value as boolean,
				//Impuesto1
				TipoContabImp1: this.tipoContabImp1Field.value as string,
				ContabDevImp1: this.contDevImp1Field.value as string,
				Impuesto1: this.impuesto1Field.value as number,
				TipoImpuesto1: this.tipoImpuestoField.value as string,
				CtrCtaImp1Id: this.ctrCtaImp1IdField.value as number,
				CtrCtaImp1GenVtsId: this.ctrCtaImp1GenVtsIdField.value as number,
				CtrCtaImp1DesCompId: this.ctrCtaImp1DesCompIdField.value as number,
				CtrCtaImp1DevCompId: this.ctrCtaImp1DevCompIdField.value as number,
				CtrCtaImp1DevVentasId: this.ctrCtaImp1DevCompIdField.value as number,
				//Impuesto2
				TipoContabImp2: this.tipoContabImp2Field.value as string,
				ContabDevImp2: this.contDevImp2Field.value as string,
				UsaImpuesto2Cantidad: this.usaImp2CantidadField.value as string,
				Impuesto2: this.impuesto2Field.value as number,
				CalculoImp2: this.calculoImp2Field.value as string,
				CtrCtaImp2Id: this.ctrCtaImp2IdField.value as number,
				CtrCtaImp2GenVtsId: this.ctrCtaImp2GenVtsIdField.value as number,
				CtrCtaImp2DesCompId: this.ctrCtaImp2DesCompIdField.value as number,
				CtrCtaImp2DevCompId: this.ctrCtaImp2DevCompIdField.value as number,
				CtrCtaImp2DevVentasId: this.ctrCtaImp2DevVentasIdField.value as number,
				Impuesto2Cantidad: 0.0
			};
			this._edit(data);
		}
	}
	private _save(data: ICreateImpuesto) {
		this._codigoImpuestoApiService.createImpuesto(data).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCodigoImpuesto.reset();
					this._snotifyservice.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyservice.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	private _edit(data: ICreateImpuesto) {
		console.log('edit', data);
		this._codigoImpuestoApiService.updateImpuesto(this.editData.id as number, data).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCodigoImpuesto.reset();
					this._snotifyservice.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyservice.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	cuentas(): void {
		console.log(this.disabled);
	}
	private _loadFormulario(): void {
		this.formCodigoImpuesto = this._formBuilder.group({
			codigo: ['', [Validators.required, Validators.maxLength(8)]],
			descripcion: ['', [Validators.required]],
			activo: ['false'],
			//impuesto1
			tipoContabImp1: ['U'],
			contDevImp1: [],
			tipoImpuesto: [],
			impuesto1: [0.0],
			ctrCtaImp1Id: [null],
			ctrCtaImp1GenVtsId: [null],
			ctrCtaImp1DesCompId: [null],
			ctrCtaImp1DevCompId: [null],
			ctrCtaImp1DevVentasId: [null],
			//impuesto2
			tipoContabImp2: ['U'],
			contDevImp2: [],
			usaImpuesto2Cantidad: ['S'],
			impuesto2: [0.0],
			calculoImp2: ['I'],
			ctrCtaImp2Id: [null],
			ctrCtaImp2GenVtsId: [null],
			ctrCtaImp2DesCompId: [null],
			ctrCtaImp2DevCompId: [null],
			ctrCtaImp2DevVentasId: [null]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.formCodigoImpuesto.controls['codigo'].setValue(this.editData.codImpuesto);
			this.formCodigoImpuesto.controls['codigo'].disable();
			this.formCodigoImpuesto.controls['descripcion'].setValue(this.editData.descripcion);
			this.formCodigoImpuesto.controls['activo'].setValue(this.editData.activo);
			//impuesto1
			this.formCodigoImpuesto.controls['tipoContabImp1'].setValue(this.editData.tipoContabImp1);
			this.formCodigoImpuesto.controls['contDevImp1'].setValue(this.editData.contDevImp1);
			this.formCodigoImpuesto.controls['tipoImpuesto'].setValue(this.editData.tipoImpuesto);
			this.formCodigoImpuesto.controls['impuesto1'].setValue(this.editData.impuesto1);
			this.formCodigoImpuesto.controls['ctrCtaImp1Id'].setValue(this.editData.ctrCtaImp1Id);
			this.formCodigoImpuesto.controls['ctrCtaImp1GenVtsId'].setValue(this.editData.ctrCtaImp1GenVtsId);
			this.formCodigoImpuesto.controls['ctrCtaImp1DesCompId'].setValue(this.editData.ctrCtaImp1DesCompId);
			this.formCodigoImpuesto.controls['ctrCtaImp1DevCompId'].setValue(this.editData.ctrCtaImp1DevCompId);
			this.formCodigoImpuesto.controls['ctrCtaImp1DevVentasId'].setValue(this.editData.ctrCtaImp1DevVentasId);
			//impuesto2
			this.formCodigoImpuesto.controls['tipoContabImp2'].setValue(this.editData.tipoContabImp2);
			this.formCodigoImpuesto.controls['contDevImp2'].setValue(this.editData.contDevImp2);
			this.formCodigoImpuesto.controls['usaImpuesto2Cantidad'].setValue(this.editData.usaImpuesto2Cantidad);
			this.formCodigoImpuesto.controls['impuesto2'].setValue(this.editData.impuesto2);
			this.formCodigoImpuesto.controls['calculoImp2'].setValue(this.editData.calculoImp2);
			this.formCodigoImpuesto.controls['ctrCtaImp2Id'].setValue(this.editData.ctrCtaImp2Id);
			this.formCodigoImpuesto.controls['ctrCtaImp2GenVtsId'].setValue(this.editData.ctrCtaImp2GenVtsId);
			this.formCodigoImpuesto.controls['ctrCtaImp2DesCompId'].setValue(this.editData.ctrCtaImp2DesCompId);
			this.formCodigoImpuesto.controls['ctrCtaImp2DevCompId'].setValue(this.editData.ctrCtaImp2DevCompId);
			this.formCodigoImpuesto.controls['ctrCtaImp2DevVentasId'].setValue(this.editData.ctrCtaImp2DevVentasId);
		}
	}
	get codigoField(): AbstractControl {
		return this.formCodigoImpuesto.get('codigo')!;
	}
	get descripcionField(): AbstractControl {
		return this.formCodigoImpuesto.get('descripcion')!;
	}
	get activoField(): AbstractControl {
		return this.formCodigoImpuesto.get('activo')!;
	}
	//impuesto1
	get tipoContabImp1Field(): AbstractControl {
		return this.formCodigoImpuesto.get('tipoContabImp1')!;
	}

	get contDevImp1Field(): AbstractControl {
		return this.formCodigoImpuesto.get('contDevImp1')!;
	}

	get tipoImpuestoField(): AbstractControl {
		return this.formCodigoImpuesto.get('tipoImpuesto')!;
	}
	get impuesto1Field(): AbstractControl {
		return this.formCodigoImpuesto.get('impuesto1')!;
	}
	get ctrCtaImp1IdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp1Id')!;
	}
	get ctrCtaImp1GenVtsIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp1GenVtsId')!;
	}
	get ctrCtaImp1DesCompIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp1DesCompId')!;
	}
	get ctrCtaImp1DevCompIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp1DevCompId')!;
	}
	get ctrCtaImp1DevVentasIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp1DevVentasId')!;
	}
	//Impuesto2
	get tipoContabImp2Field(): AbstractControl {
		return this.formCodigoImpuesto.get('tipoContabImp2')!;
	}
	get contDevImp2Field(): AbstractControl {
		return this.formCodigoImpuesto.get('contDevImp2')!;
	}
	get usaImp2CantidadField(): AbstractControl {
		return this.formCodigoImpuesto.get('usaImpuesto2Cantidad')!;
	}
	get impuesto2Field(): AbstractControl {
		return this.formCodigoImpuesto.get('impuesto2')!;
	}
	get calculoImp2Field(): AbstractControl {
		return this.formCodigoImpuesto.get('calculoImp2')!;
	}
	get ctrCtaImp2IdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp2Id')!;
	}
	get ctrCtaImp2GenVtsIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp2GenVtsId')!;
	}
	get ctrCtaImp2DesCompIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp2DesCompId')!;
	}
	get ctrCtaImp2DevCompIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp2DevCompId')!;
	}
	get ctrCtaImp2DevVentasIdField(): AbstractControl {
		return this.formCodigoImpuesto.get('ctrCtaImp2DevVentasId')!;
	}
}
