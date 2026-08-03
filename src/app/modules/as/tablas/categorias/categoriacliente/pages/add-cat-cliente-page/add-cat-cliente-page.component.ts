/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IRequestCreateCatCliente } from '../../model/catCliente-api-model-interface';
import { CatClienteApiService } from '../../services/cat-cliente-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CentroCuentaApiService } from '@app/modules/cg/administracion/centrocuenta/services/centro-cuenta-api.service';
import { IResponseCentroCuenta } from '@app/modules/cg/administracion/centrocuenta/model/centroCuenta-api-model-interface';

@Component({
	selector: 'app-add-cat-cliente-page',
	templateUrl: './add-cat-cliente-page.component.html',
	styleUrls: ['./add-cat-cliente-page.component.scss']
})
export class AddCatClientePageComponent {
	constructor(
		private _formBuilder: FormBuilder,
		private _categoriaAoiService: CatClienteApiService,
		private _snotifyService: SnotifyService,
		private _centroCuentaApiService: CentroCuentaApiService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddCatClientePageComponent>
	) {
		this._loadFormulario();
		this._loadCentroCuenta(1, 2000);
	}
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	disableButtonSave = false;
	formCategoriaCliente!: FormGroup;
	listCentroCuenta: IResponseCentroCuenta[] = [];
	private _loadFormulario(): void {
		this.formCategoriaCliente = this._formBuilder.group({
			categoria: ['', [Validators.required, Validators.maxLength(10)]],
			nombre: ['', [Validators.required, Validators.maxLength(100)]],
			//Tab Facturacion
			CtrCtaVentasId: [null],
			CtrCtaVentasExentaId: [null],
			CtrCtaDevSobreVtaId: [null],
			CtrCtaDescuentaGralId: [null],
			CtrCtaCostoVentasId: [null],
			CtrCtaDescuentoLineaId: [null],
			CtrCtaCostoLineasId: [null],
			CtrCtaPagoContadoId: [null],
			CtrCtaComisionVendedorId: [null],
			CtrCtaComisionCobradorId: [null],
			CtrCtaDescBonificacionId: [null],
			CtrCtaAjustesRedondeoId: [null],
			//Tab CC
			ctrCtaCuentasXCobrar: [null],
			ctrCtaLetraxCobrar: [null],
			ctrCtaProntoPago: [null],
			ctrCtaInteresesdeMora: [null],
			ctrCtaRecibos: [null],
			ctrCtaImpuesto1: [null],
			ctrCtaImpuesto2: [null],
			ctrCtaAnticipos: [null],
			ctrCtaCierreDebitos: [null],
			ctrCtaCierreCreditos: [null],
			ctrCtaInteresCorriente: [null],
			//Tab Otros
			Rubro1CC: [null],
			Rubro2CC: [null]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';

			//Facturacion
			this.formCategoriaCliente.controls['categoria'].setValue(this.editData.codCategoriaCliente);
			this.formCategoriaCliente.controls['categoria'].disable();
			this.formCategoriaCliente.controls['nombre'].setValue(this.editData.descripcion);
			this.formCategoriaCliente.controls['CtrCtaVentasId'].setValue(this.editData.ctrCtaVentasId);
			this.formCategoriaCliente.controls['CtrCtaVentasExentaId'].setValue(this.editData.ctrCtaVentasExenId);
			this.formCategoriaCliente.controls['CtrCtaDevSobreVtaId'].setValue(this.editData.ctrCtaDevVentasId);
			this.formCategoriaCliente.controls['CtrCtaDescuentaGralId'].setValue(this.editData.ctrCtaDescGralId);
			this.formCategoriaCliente.controls['CtrCtaCostoVentasId'].setValue(this.editData.ctrCtaCostVentId);
			this.formCategoriaCliente.controls['CtrCtaDescuentoLineaId'].setValue(this.editData.ctrCtaDescLinId);
			this.formCategoriaCliente.controls['CtrCtaCostoLineasId'].setValue(this.editData.ctrCtaCostLinId);
			this.formCategoriaCliente.controls['CtrCtaPagoContadoId'].setValue(this.editData.ctrCtaContadoId);
			this.formCategoriaCliente.controls['CtrCtaComisionVendedorId'].setValue(this.editData.ctrCtaVendComId);
			this.formCategoriaCliente.controls['CtrCtaComisionCobradorId'].setValue(this.editData.ctrCtaCobrComId);
			this.formCategoriaCliente.controls['CtrCtaDescBonificacionId'].setValue(this.editData.ctrCtaDescBonifId);
			this.formCategoriaCliente.controls['CtrCtaAjustesRedondeoId'].setValue(this.editData.ctrCtaAjusteRedondeoId);
			//Cuentas Por pagar
			this.formCategoriaCliente.controls['ctrCtaCuentasXCobrar'].setValue(this.editData.ctrCtaCCId);
			this.formCategoriaCliente.controls['ctrCtaLetraxCobrar'].setValue(this.editData.ctrCtaLCId);
			this.formCategoriaCliente.controls['ctrCtaProntoPago'].setValue(this.editData.ctrCtaProntoPagoCCId);
			this.formCategoriaCliente.controls['ctrCtaInteresesdeMora'].setValue(this.editData.ctrCtaIntMoraCCId);
			this.formCategoriaCliente.controls['ctrCtaRecibos'].setValue(this.editData.ctrCtaRecibosCCId);
			this.formCategoriaCliente.controls['ctrCtaImpuesto1'].setValue(this.editData.ctrCtaImpuesto1CCId);
			this.formCategoriaCliente.controls['ctrCtaImpuesto2'].setValue(this.editData.ctrCtaImpuesto2CCId);
			this.formCategoriaCliente.controls['ctrCtaAnticipos'].setValue(this.editData.ctrCtaAnticipoCCId);
			this.formCategoriaCliente.controls['ctrCtaCierreDebitos'].setValue(this.editData.ctrCtaDebitoCCId);
			this.formCategoriaCliente.controls['ctrCtaCierreCreditos'].setValue(this.editData.ctrCtaCreditoCCId);
			this.formCategoriaCliente.controls['ctrCtaInteresCorriente'].setValue(this.editData.ctrCtaIntCorrId);
			//Rubros
			this.formCategoriaCliente.controls['Rubro1CC'].setValue(this.editData.ctrCtaRubro1CCId);
			this.formCategoriaCliente.controls['Rubro2CC'].setValue(this.editData.ctrCtaRubro2CCId);
		}
	}
	consultar(): void {
		console.log('demo');
	}
	onclickCategoria(): void {
		if (this.formCategoriaCliente.invalid) {
			return;
		}

		if (!this.editData) {
			const sendData: IRequestCreateCatCliente = {
				codCategoria: this.CodCategoriaClienteField.value as string,
				descripcion: this.DescripcionField.value as string,
				ctrCtaVentasExenId: this.CtrCtaVentasExenIdField.value as number,
				ctrCtaVentasId: this.CtrCtaVentasIdField.value as number,
				ctrCtaAjusteRedondeoId: this.CtrCtaAjusteRedondeoIdField.value as number,
				ctrCtaAnticipoCCId: this.CtrCtaAnticipoCCIdField.value as number,
				ctrCtaCCId: this.CtrCtaCCIdField.value as number,
				ctrCtaCobrComId: this.CtrCtaCobrComIdField.value as number,
				ctrCtaContadoId: this.CtrCtaContadoIdField.value as number,
				ctrCtaCostLinId: this.CtrCtaCostLinIdField.value as number,
				ctrCtaCostVentId: this.CtrCtaCostVentIdField.value as number,
				ctrCtaCreditoCCId: this.CtrCtaCreditoCCIdField.value as number,
				ctrCtaDebitoCCId: this.CtrCtaDebitoCCIdField.value as number,
				ctrCtaDescBonifId: this.CtrCtaDescBonifIdField.value as number,
				ctrCtaDescGralId: this.CtrCtaDescGralIdField.value as number,
				ctrCtaDescLinId: this.CtrCtaDescLinIdField.value as number,
				ctrCtaDevVentasId: this.CtrCtaDevVentasIdField.value as number,
				ctrCtaImpuesto1CCId: this.CtrCtaImpuesto1CCIdField.value as number,
				ctrCtaImpuesto2CCId: this.CtrCtaImpuesto2CCIdField.value as number,
				ctrCtaIntCorrId: this.CtrCtaIntCorrIdField.value as number,
				ctrCtaIntMoraCCId: this.CtrCtaIntMoraCCIdField.value as number,
				ctrCtaLCId: this.CtrCtaLCIdField.value as number,
				ctrCtaProntoPagoCCId: this.CtrCtaProntoPagoCCIdField.value as number,
				ctrCtaRecibosCCId: this.CtrCtaRecibosCCIdField.value as number,
				ctrCtaRubro1CCId: this.CtrCtaRubro1CCIdField.value as number,
				ctrCtaRubro2CCId: this.CtrCtaRubro2CCIdField.value as number,
				ctrCtaVendComId: this.CtrCtaVendComIdField.value as number
			};
			this._save(sendData);
		} else {
			const sendData: IRequestCreateCatCliente = {
				codCategoria: this.CodCategoriaClienteField.value as string,
				descripcion: this.DescripcionField.value as string,
				//Factura
				ctrCtaVentasId: this.CtrCtaVentasIdField.value as number,
				ctrCtaVentasExenId: this.CtrCtaVentasExenIdField.value as number,
				ctrCtaDevVentasId: this.CtrCtaDevVentasIdField.value as number,
				ctrCtaDescGralId: this.CtrCtaDescGralIdField.value as number,
				ctrCtaCostVentId: this.CtrCtaCostVentIdField.value as number,
				ctrCtaDescLinId: this.CtrCtaDescLinIdField.value as number,
				ctrCtaCostLinId: this.CtrCtaCostLinIdField.value as number,
				ctrCtaContadoId: this.CtrCtaContadoIdField.value as number,
				ctrCtaVendComId: this.CtrCtaVendComIdField.value as number,
				ctrCtaCobrComId: this.CtrCtaCobrComIdField.value as number,
				ctrCtaDescBonifId: this.CtrCtaDescBonifIdField.value as number,
				ctrCtaAjusteRedondeoId: this.CtrCtaAjusteRedondeoIdField.value as number,
				//Cuentas por Cobrar
				ctrCtaCCId: this.CtrCtaCCIdField.value as number,
				ctrCtaLCId: this.CtrCtaLCIdField.value as number,
				ctrCtaProntoPagoCCId: this.CtrCtaProntoPagoCCIdField.value as number,
				ctrCtaIntMoraCCId: this.CtrCtaIntMoraCCIdField.value as number,
				ctrCtaRecibosCCId: this.CtrCtaRecibosCCIdField.value as number,
				ctrCtaImpuesto1CCId: this.CtrCtaImpuesto1CCIdField.value as number,
				ctrCtaImpuesto2CCId: this.CtrCtaImpuesto2CCIdField.value as number,
				ctrCtaAnticipoCCId: this.CtrCtaAnticipoCCIdField.value as number,
				ctrCtaCreditoCCId: this.CtrCtaCreditoCCIdField.value as number,
				ctrCtaDebitoCCId: this.CtrCtaDebitoCCIdField.value as number,
				ctrCtaIntCorrId: this.CtrCtaIntCorrIdField.value as number,
				//Rubros
				ctrCtaRubro1CCId: this.CtrCtaRubro1CCIdField.value as number,
				ctrCtaRubro2CCId: this.CtrCtaRubro2CCIdField.value as number
			};
			this._edit(sendData);
		}
	}
	private _save(categoriaCli: IRequestCreateCatCliente) {
		this._categoriaAoiService.createCategoriaCliente(categoriaCli).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCategoriaCliente.reset();
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
	private _edit(categoriaCli: IRequestCreateCatCliente) {
		this._categoriaAoiService.updateCategoriaCliente(this.editData.id as number, categoriaCli).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCategoriaCliente.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('edit');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (err) => {
				console.log(err);
			}
		});
	}
	private _loadCentroCuenta(page: number, rows: number): void {
		this._centroCuentaApiService.getCentroCuenta(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCentroCuenta = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get CodCategoriaClienteField(): AbstractControl {
		return this.formCategoriaCliente.get('categoria')!;
	}
	get DescripcionField(): AbstractControl {
		return this.formCategoriaCliente.get('nombre')!;
	}
	get CtrCtaVentasExenIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaVentasExentaId')!;
	}
	get CtrCtaVentasIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaVentasId')!;
	}
	get CtrCtaAjusteRedondeoIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaAjustesRedondeoId')!;
	}
	get CtrCtaAnticipoCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaAnticipos')!;
	}
	get CtrCtaCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaCuentasXCobrar')!;
	}
	get CtrCtaCobrComIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaComisionCobradorId')!;
	}
	get CtrCtaContadoIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaPagoContadoId')!;
	}
	get CtrCtaCostLinIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaCostoLineasId')!;
	}
	get CtrCtaCostVentIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaCostoVentasId')!;
	}
	get CtrCtaCreditoCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaCierreCreditos')!;
	}
	get CtrCtaDebitoCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaCierreDebitos')!;
	}
	get CtrCtaDescBonifIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaDescBonificacionId')!;
	}
	get CtrCtaDescGralIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaDescuentaGralId')!;
	}
	get CtrCtaDescLinIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaDescuentoLineaId')!;
	}
	get CtrCtaDevVentasIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaDevSobreVtaId')!;
	}
	get CtrCtaImpuesto1CCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaImpuesto1')!;
	}
	get CtrCtaImpuesto2CCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaImpuesto2')!;
	}
	get CtrCtaIntCorrIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaInteresCorriente')!;
	}
	get CtrCtaIntMoraCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaInteresesdeMora')!;
	}
	get CtrCtaLCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaLetraxCobrar')!;
	}
	get CtrCtaProntoPagoCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaProntoPago')!;
	}
	get CtrCtaRecibosCCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('ctrCtaRecibos')!;
	}
	get CtrCtaRubro1CCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('Rubro1CC')!;
	}
	get CtrCtaRubro2CCIdField(): AbstractControl {
		return this.formCategoriaCliente.get('Rubro2CC')!;
	}
	get CtrCtaVendComIdField(): AbstractControl {
		return this.formCategoriaCliente.get('CtrCtaComisionVendedorId')!;
	}
}
