/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IResponseCentroCuenta } from '@app/modules/cg/administracion/centrocuenta/model/centroCuenta-api-model-interface';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CtaProveedorApiService } from '../../service/cta-proveedor-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CentroCuentaApiService } from '@app/modules/cg/administracion/centrocuenta/services/centro-cuenta-api.service';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IRequestCreateCtaProveedor } from '../../model/ctaProveedor-api-model-interface';

@Component({
	selector: 'app-add-cat-proveedor-page',
	templateUrl: './add-cat-proveedor-page.component.html',
	styleUrls: ['./add-cat-proveedor-page.component.scss']
})
export class AddCatProveedorPageComponent {
	constructor(
		private _formBuilder: FormBuilder,
		private _catProveedorApiService: CtaProveedorApiService,
		private _snotifyService: SnotifyService,
		private _centroCuentaApiService: CentroCuentaApiService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddCatProveedorPageComponent>
	) {
		this._loadFormulario(), this._loadCentroCuenta();
	}
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	disableButtonSave = false;
	formCategoriaProveedor!: FormGroup;
	listCentroCuenta: IResponseCentroCuenta[] = [];
	private _loadFormulario(): void {
		this.formCategoriaProveedor = this._formBuilder.group({
			categoria: ['', [Validators.required, Validators.maxLength(10)]],
			nombre: ['', [Validators.required, Validators.maxLength(100)]],
			//Tab Cuentas por Pagar
			cuentaPagar: [null],
			ajustexRedondeo: [null],
			letraxPagar: [null],
			prontoPago: [null],
			comisiones: [null],
			anticipos: [null],
			cierreDebito: [null],
			cierreCredito: [null],
			//Tab Impuesto y Rubros
			impuesto1: [null],
			impuesto2: [null],
			rubro1: [null],
			rubro2: [null]
		});
		if (this.editData) {
			console.log(this.editData);
			this.actionBtn = 'Editar';
			this.formCategoriaProveedor.controls['categoria'].setValue(this.editData.codCategoriaProveedor);
			this.formCategoriaProveedor.controls['categoria'].disable();
			this.formCategoriaProveedor.controls['nombre'].setValue(this.editData.descripcion);
			//Tab Cuentas por Pagar
			this.formCategoriaProveedor.controls['cuentaPagar'].setValue(this.editData.ctrCtaCPId);
			this.formCategoriaProveedor.controls['ajustexRedondeo'].setValue(this.editData.ctrCtaAjusteRedondeoId);
			this.formCategoriaProveedor.controls['letraxPagar'].setValue(this.editData.ctrCtaLPId);
			this.formCategoriaProveedor.controls['prontoPago'].setValue(this.editData.ctrCtaProntoPagoCPId);
			this.formCategoriaProveedor.controls['comisiones'].setValue(this.editData.ctrCtaComisionesCPId);
			this.formCategoriaProveedor.controls['anticipos'].setValue(this.editData.ctrCtaAnticipoCPId);
			this.formCategoriaProveedor.controls['cierreDebito'].setValue(this.editData.ctrCtrDebitoCPId);
			this.formCategoriaProveedor.controls['cierreCredito'].setValue(this.editData.ctrCtaCreditoCPId);
			//Tab Impuesto y Rubros
			this.formCategoriaProveedor.controls['impuesto1'].setValue(this.editData.ctrCtaImpuesto1CPId);
			this.formCategoriaProveedor.controls['impuesto2'].setValue(this.editData.ctrCtaImpuesto2CPId);
			this.formCategoriaProveedor.controls['rubro1'].setValue(this.editData.ctrCtaRubro1CPId);
			this.formCategoriaProveedor.controls['rubro2'].setValue(this.editData.ctrCtaRubro2CPId);
		}
	}
	onclickCategoria(): void {
		if (this.formCategoriaProveedor.invalid) {
			return;
		}
		if (!this.editData) {
			const sendData: IRequestCreateCtaProveedor = {
				codCategoria: this.codCategoriaField.value as string,
				descripcion: this.descripcionField.value as string,
				ctrCtaCPId: this.cuentaPagarField.value as number,
				ctrCtaAjusteRedondeoId: this.ajustexRedondeoField.value as number,
				ctrCtaLPId: this.letraxPagarField.value as number,
				ctrCtaProntoPagoCpId: this.prontoPagoField.value as number,
				ctrCtaComisionesCpId: this.comisionesField.value as number,
				ctrCtaAnticipoId: this.anticiposField.value as number,
				ctrCtaDebitoCpId: this.cierreDebitoField.value as number,
				ctrCtaCreditoCPId: this.cierreCreditoField.value as number,
				ctrCtaImpuesto1CpId: this.impuesto1Field.value as number,
				ctrCtaImpuesto2CpId: this.impuesto2Field.value as number,
				ctrCtaRubro1CpId: this.rubro1Field.value as number,
				ctrCtaRubro2CpId: this.rubro2Field.value as number
			};
			this._save(sendData);
		} else {
			const sendData: IRequestCreateCtaProveedor = {
				codCategoria: this.codCategoriaField.value as string,
				descripcion: this.descripcionField.value as string,
				ctrCtaCPId: this.cuentaPagarField.value as number,
				ctrCtaAjusteRedondeoId: this.ajustexRedondeoField.value as number,
				ctrCtaLPId: this.letraxPagarField.value as number,
				ctrCtaProntoPagoCpId: this.prontoPagoField.value as number,
				ctrCtaComisionesCpId: this.comisionesField.value as number,
				ctrCtaAnticipoId: this.anticiposField.value as number,
				ctrCtaDebitoCpId: this.cierreDebitoField.value as number,
				ctrCtaCreditoCPId: this.cierreCreditoField.value as number,
				ctrCtaImpuesto1CpId: this.impuesto1Field.value as number,
				ctrCtaImpuesto2CpId: this.impuesto2Field.value as number,
				ctrCtaRubro1CpId: this.rubro1Field.value as number,
				ctrCtaRubro2CpId: this.rubro2Field.value as number
			};
			this._edit(sendData);
		}
	}

	private _save(data: IRequestCreateCtaProveedor): void {
		this._catProveedorApiService.createCategoriaProveedor(data).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCategoriaProveedor.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (error) => {
				console.log(error);
			}
		});
	}
	private _edit(data: IRequestCreateCtaProveedor): void {
		console.log(data);
		this._catProveedorApiService.updateCategoriaProveedor(this.editData.id as number, data).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCategoriaProveedor.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('edit');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (error) => {
				console.log(error);
			}
		});
	}
	private _loadCentroCuenta(): void {
		this._centroCuentaApiService.getCentroCuenta(1, 10000).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCentroCuenta = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get codCategoriaField(): AbstractControl {
		return this.formCategoriaProveedor.get('categoria')!;
	}
	get descripcionField(): AbstractControl {
		return this.formCategoriaProveedor.get('nombre')!;
	}

	get cuentaPagarField(): AbstractControl {
		return this.formCategoriaProveedor.get('cuentaPagar')!;
	}
	get ajustexRedondeoField(): AbstractControl {
		return this.formCategoriaProveedor.get('ajustexRedondeo')!;
	}
	get letraxPagarField(): AbstractControl {
		return this.formCategoriaProveedor.get('letraxPagar')!;
	}
	get prontoPagoField(): AbstractControl {
		return this.formCategoriaProveedor.get('prontoPago')!;
	}
	get comisionesField(): AbstractControl {
		return this.formCategoriaProveedor.get('comisiones')!;
	}
	get anticiposField(): AbstractControl {
		return this.formCategoriaProveedor.get('anticipos')!;
	}
	get cierreDebitoField(): AbstractControl {
		return this.formCategoriaProveedor.get('cierreDebito')!;
	}
	get cierreCreditoField(): AbstractControl {
		return this.formCategoriaProveedor.get('cierreCredito')!;
	}
	get impuesto1Field(): AbstractControl {
		return this.formCategoriaProveedor.get('impuesto1')!;
	}
	get impuesto2Field(): AbstractControl {
		return this.formCategoriaProveedor.get('impuesto2')!;
	}
	get rubro1Field(): AbstractControl {
		return this.formCategoriaProveedor.get('rubro1')!;
	}
	get rubro2Field(): AbstractControl {
		return this.formCategoriaProveedor.get('rubro2')!;
	}
}
