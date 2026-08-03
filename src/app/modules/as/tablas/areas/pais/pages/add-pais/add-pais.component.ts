/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ICrearPais } from '../../service/pais-api-model-interface';
import { PaisApiService } from '../../service/pais-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CentroCuentaApiService } from '@app/modules/cg/administracion/centrocuenta/services/centro-cuenta-api.service';
import { IResponseCentroCuenta } from '@app/modules/cg/administracion/centrocuenta/model/centroCuenta-api-model-interface';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Component({
	selector: 'app-add-pais',
	templateUrl: './add-pais.component.html',
	styleUrls: ['./add-pais.component.scss']
})
export class AddPaisComponent {
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	PaisForm!: FormGroup;
	disableButtonSave = false;
	listCentroCuenta: IResponseCentroCuenta[] = [];
	value = 'Clear me';
	constructor(
		private _formBuilder: FormBuilder,
		private _paisApiService: PaisApiService,
		private _snotifyService: SnotifyService,
		private _centroCuentaApiService: CentroCuentaApiService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddPaisComponent>
	) {
		this._loadFormGroup();
		this._loadCentroCuenta(1, 100000);
	}

	private _loadFormGroup(): void {
		this.PaisForm = this._formBuilder.group({
			codPais: ['', [Validators.required, Validators.maxLength(4)]],
			nombre: ['', [Validators.required, Validators.maxLength(100)]],
			//Tab Facturacion
			ctrCtaVentas: [null],
			ctrCtaVentasExenta: [null],
			ctrCtaDevSobreVta: [null],
			ctrCtaDescuentaGral: [null],
			ctrCtaCostoVentas: [null],
			ctrCtaDescuentoLinea: [null],
			ctrCtaCostoLineas: [null],
			ctrCtaPagoContado: [null],
			ctrCtaGastoComision: [null],
			ctrCtaDescBonificacion: [null],
			ctrCtaAjustesRedondeo: [null],
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
			//Tab CP
			ctrCtaCuentasXPagar: [null],
			ctrCtaLetraxPagar: [null],
			ctrCtaProntoPagoCP: [null],
			ctrCtaComisiones: [null],
			ctrCtaImpuesto1CP: [null],
			ctrCtaImpuesto2CP: [null],
			ctrCtaAnticiposCP: [null],
			ctrCtaCierreDebitosCP: [null],
			ctrCtaCierreCreditosCP: [null],
			//Tab Otros
			Rubro1CC: [null],
			Rubro2CC: [null],
			Rubro1CP: [null],
			Rubro2CP: [null],
			PaisISO: [null, [Validators.required, Validators.maxLength(100)]]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.PaisForm.controls['codPais'].setValue(this.editData.codPais);
			this.PaisForm.controls['codPais'].disable();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.PaisForm.controls['nombre'].setValue(this.editData.nombre);

			this.PaisForm.controls['ctrCtaVentas'].setValue(this.editData.ctrCtaVentasId);
			this.PaisForm.controls['ctrCtaVentasExenta'].setValue(this.editData.ctrCtaVentasExenId);
			this.PaisForm.controls['ctrCtaDevSobreVta'].setValue(this.editData.ctrCtaDevVentasId);
			this.PaisForm.controls['ctrCtaDescuentaGral'].setValue(this.editData.ctrCtaDescGralId);
			this.PaisForm.controls['ctrCtaCostoVentas'].setValue(this.editData.ctrCtaCostoVenId);
			this.PaisForm.controls['ctrCtaDescuentoLinea'].setValue(this.editData.ctrCtaDescLinId);
			this.PaisForm.controls['ctrCtaCostoLineas'].setValue(this.editData.ctrCtaCostoLinId);
			this.PaisForm.controls['ctrCtaPagoContado'].setValue(this.editData.ctrCtaContadoId);
			this.PaisForm.controls['ctrCtaGastoComision'].setValue(this.editData.ctrCtaGasComId);
			this.PaisForm.controls['ctrCtaDescBonificacion'].setValue(this.editData.ctrCtaDescBonifId);
			this.PaisForm.controls['ctrCtaAjustesRedondeo'].setValue(this.editData.ctrCtaAjusteRedondeoId);
			//Tab CC
			this.PaisForm.controls['ctrCtaCuentasXCobrar'].setValue(this.editData.ctrCtaCCId);
			this.PaisForm.controls['ctrCtaLetraxCobrar'].setValue(this.editData.ctrCtaLCId);
			this.PaisForm.controls['ctrCtaProntoPago'].setValue(this.editData.ctrCtaProntoPagoCCId);
			this.PaisForm.controls['ctrCtaInteresesdeMora'].setValue(this.editData.ctrCtaIntMoraCCId);
			this.PaisForm.controls['ctrCtaRecibos'].setValue(this.editData.ctrCtaRecibosCCId);
			this.PaisForm.controls['ctrCtaImpuesto1'].setValue(this.editData.ctrCtaImpuesto1CCId);
			this.PaisForm.controls['ctrCtaImpuesto2'].setValue(this.editData.ctrCtaImpuesto2CCid);
			this.PaisForm.controls['ctrCtaAnticipos'].setValue(this.editData.ctrCtaAnticipoCCId);
			this.PaisForm.controls['ctrCtaCierreDebitos'].setValue(this.editData.ctrCtaDebitoCCId);
			this.PaisForm.controls['ctrCtaCierreCreditos'].setValue(this.editData.ctrCtaCreditoCCId);
			this.PaisForm.controls['ctrCtaInteresCorriente'].setValue(this.editData.ctrCtaIntCorrienteId);
			//Tab CP
			this.PaisForm.controls['ctrCtaCuentasXPagar'].setValue(this.editData.ctrCtoCPId);
			this.PaisForm.controls['ctrCtaLetraxPagar'].setValue(this.editData.ctrCtaLPId);
			this.PaisForm.controls['ctrCtaProntoPagoCP'].setValue(this.editData.ctrCtaProntoPagoCPId);
			this.PaisForm.controls['ctrCtaComisiones'].setValue(this.editData.ctrCtaComisionCPId);
			this.PaisForm.controls['ctrCtaImpuesto1CP'].setValue(this.editData.ctrCtaImpuesto1CP);
			this.PaisForm.controls['ctrCtaImpuesto2CP'].setValue(this.editData.ctrCtaImpuesto2CPId);
			this.PaisForm.controls['ctrCtaAnticiposCP'].setValue(this.editData.ctrCtaAnticipoCPId);
			this.PaisForm.controls['ctrCtaCierreDebitosCP'].setValue(this.editData.ctrCtaDebitoCPId);
			this.PaisForm.controls['ctrCtaCierreCreditosCP'].setValue(this.editData.ctrCtaCreditoCPId);
			//Tab Otros
			this.PaisForm.controls['Rubro1CC'].setValue(this.editData.ctrCtaRubro1CCId);
			this.PaisForm.controls['Rubro2CC'].setValue(this.editData.ctrCtaRubro2CCId);
			this.PaisForm.controls['Rubro1CP'].setValue(this.editData.ctrCtaRubro1CPId);
			this.PaisForm.controls['Rubro2CP'].setValue(this.editData.ctrCtaRubro2CPId);
			this.PaisForm.controls['PaisISO'].setValue(this.editData.codigoISO);
		}
	}

	clickSave(): void {
		console.log('guardr pais');
	}
	onclickPais(): void {
		if (this.PaisForm.invalid) {
			return;
		}
		if (!this.editData) {
			const sendPais: ICrearPais = {
				codPais: this.codPaisField.value as string,
				nombre: this.nombreField.value as string,
				//Tab Facturacion
				ctrCtaVentasId: this.ccVentasField.value as number,
				ctrCtaVentasExentaId: this.ccVentaExenField.value as number,
				ctrCtaDevSobreVta: this.ccDevVentasField.value as number,
				ctrCtaDescuentaGral: this.ccDesGenlField.value as number,
				ctrCtaCostoVentas: this.ccCostoVentaField.value as number,
				ctrCtaDescuentoLinea: this.ccDescLinField.value as number,
				ctrCtaCostoLineas: this.ccCostoLinField.value as number,
				ctrCtaPagoContado: this.ccContadoField.value as number,
				ctrCtaGastoComision: this.ccGasComField.value as number,
				ctrCtaDescBonificacion: this.ccDescBonifField.value as number,
				ctrCtaAjustesRedondeo: this.ccAjusteRedondeoField.value as number,
				//Tab CC
				ctrCtaCuentasXCobrar: this.ccCtaCCField.value as number,
				ctrCtaLetraxCobrar: this.ccLcField.value as number,
				ctrCtaProntoPago: this.ccProntoPagoCCField.value as number,
				ctrCtaInteresesdeMora: this.ccIntMoraCCField.value as number,
				ctrCtaRecibos: this.ccReciboCCField.value as number,
				ctrCtaImpuesto1: this.ccImpuesto1CCField.value as number,
				ctrCtaImpuesto2: this.ccImpuesto1CPField.value as number,
				ctrCtaAnticipos: this.ccAnticipoCCField.value as number,
				ctrCtaCierreDebitos: this.ccDebitoCCField.value as number,
				ctrCtaCierreCreditos: this.ccCreditoCCField.value as number,
				ctrCtaInteresCorriente: this.ccIntCorrienteField.value as number,
				//Tab CP
				ctrCtaCuentasXPagar: this.cccpField.value as number,
				ctrCtaLetraxPagar: this.cclpField.value as number,
				ctrCtaProntoPagoCP: this.ccProntoPagoCPField.value as number,
				ctrCtaComisiones: this.ccComisionCPField.value as number,
				ctrCtaImpuesto1CP: this.ccImpuesto1CPField.value as number,
				ctrCtaImpuesto2CP: this.ccImpuesto2CPField.value as number,
				ctrCtaAnticiposCP: this.ccAnticipoCP.value as number,
				ctrCtaCierreDebitosCP: this.ccDebitosCPField.value as number,
				ctrCtaCierreCreditosCP: this.ccCreditosCPField.value as number,
				//Tab Otros
				Rubro1CC: this.ccRubro1CCField.value as number,
				Rubro2CC: this.ccRubro2CCField.value as number,
				Rubro1CP: this.ccRubro1CPField.value as number,
				Rubro2CP: this.ccRubro2CPField.value as number,
				codigoISO: this.codigoISOField.value as string
			};
			this._save(sendPais);
		} else {
			const sendPais: ICrearPais = {
				codPais: this.codPaisField.value as string,
				nombre: this.nombreField.value as string,
				//Tab Facturacion
				ctrCtaVentasId: this.ccVentasField.value as number,
				ctrCtaVentasExentaId: this.ccVentaExenField.value as number,
				ctrCtaDevSobreVta: this.ccDevVentasField.value as number,
				ctrCtaDescuentaGral: this.ccDesGenlField.value as number,
				ctrCtaCostoVentas: this.ccCostoVentaField.value as number,
				ctrCtaDescuentoLinea: this.ccDescLinField.value as number,
				ctrCtaCostoLineas: this.ccCostoLinField.value as number,
				ctrCtaPagoContado: this.ccProntoPagoCPField.value as number,
				ctrCtaGastoComision: this.ccGasComField.value as number,
				ctrCtaDescBonificacion: this.ccDescBonifField.value as number,
				ctrCtaAjustesRedondeo: this.ccAjusteRedondeoField.value as number,
				//Tab CC
				ctrCtaCuentasXCobrar: this.ccCtaCCField.value as number,
				ctrCtaLetraxCobrar: this.ccLcField.value as number,
				ctrCtaProntoPago: this.ccProntoPagoCCField.value as number,
				ctrCtaInteresesdeMora: this.ccIntMoraCCField.value as number,
				ctrCtaRecibos: this.ccReciboCCField.value as number,
				ctrCtaImpuesto1: this.ccImpuesto1CCField.value as number,
				ctrCtaImpuesto2: this.ccImpuesto1CPField.value as number,
				ctrCtaAnticipos: this.ccAnticipoCCField.value as number,
				ctrCtaCierreDebitos: this.ccDebitoCCField.value as number,
				ctrCtaCierreCreditos: this.ccCreditoCCField.value as number,
				ctrCtaInteresCorriente: this.ccIntCorrienteField.value as number,
				//Tab CP
				ctrCtaCuentasXPagar: this.cccpField.value as number,
				ctrCtaLetraxPagar: this.cclpField.value as number,
				ctrCtaProntoPagoCP: this.ccProntoPagoCPField.value as number,
				ctrCtaComisiones: this.ccComisionCPField.value as number,
				ctrCtaImpuesto1CP: this.ccImpuesto1CPField.value as number,
				ctrCtaImpuesto2CP: this.ccImpuesto2CPField.value as number,
				ctrCtaAnticiposCP: this.ccAnticipoCP.value as number,
				ctrCtaCierreDebitosCP: this.ccDebitosCPField.value as number,
				ctrCtaCierreCreditosCP: this.ccCreditosCPField.value as number,
				//Tab Otros
				Rubro1CC: this.ccRubro1CCField.value as number,
				Rubro2CC: this.ccRubro2CCField.value as number,
				Rubro1CP: this.ccRubro1CPField.value as number,
				Rubro2CP: this.ccRubro2CPField.value as number,
				codigoISO: this.codigoISOField.value as string
			};
			this._edit(sendPais);
		}
	}
	private _loadCentroCuenta(page: number, rows: number): void {
		this._centroCuentaApiService.getCentroCuenta(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					console.log(response.success);
					this.listCentroCuenta = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	private _save(pais: ICrearPais) {
		this._paisApiService.createPais(pais).subscribe({
			next: (response) => {
				if (response.success) {
					this.PaisForm.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	private _edit(pais: ICrearPais) {
		this._paisApiService.update(this.editData.id as number, pais).subscribe({
			next: (response) => {
				if (response.success) {
					this.PaisForm.reset();
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

	//Facturacion
	get ccVentasField(): AbstractControl {
		return this.PaisForm.get('ctrCtaVentas')!;
	}
	get ccVentaExenField(): AbstractControl {
		return this.PaisForm.get('ctrCtaVentasExenta')!;
	}
	get ccDevVentasField(): AbstractControl {
		return this.PaisForm.get('ctrCtaDevSobreVta')!;
	}
	get ccDesGenlField(): AbstractControl {
		return this.PaisForm.get('ctrCtaDescuentaGral')!;
	}
	get ccCostoVentaField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCostoVentas')!;
	}
	get ccDescLinField(): AbstractControl {
		return this.PaisForm.get('ctrCtaDescuentoLinea')!;
	}
	get ccCostoLinField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCostoLineas')!;
	}
	get ccContadoField(): AbstractControl {
		return this.PaisForm.get('ctrCtaPagoContado')!;
	}
	get ccComisionCPField(): AbstractControl {
		return this.PaisForm.get('ctrCtaGastoComision')!;
	}
	get ccDescBonifField(): AbstractControl {
		return this.PaisForm.get('ctrCtaDescBonificacion')!;
	}
	get ccAjusteRedondeoField(): AbstractControl {
		return this.PaisForm.get('ctrCtaAjustesRedondeo')!;
	}
	//Fin Facturacion
	//Cuentas X Cobrar
	get ccCtaCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCuentasXCobrar')!;
	}
	get ccLcField(): AbstractControl {
		return this.PaisForm.get('ctrCtaLetraxCobrar')!;
	}
	get ccProntoPagoCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaProntoPago')!;
	}
	get ccIntMoraCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaInteresesdeMora')!;
	}
	get ccReciboCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaRecibos')!;
	}
	get ccImpuesto1CCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaImpuesto1')!;
	}
	get ccImpuesto2CCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaImpuesto2')!;
	}
	get ccAnticipoCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaAnticipos')!;
	}
	get ccDebitoCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCierreDebitos')!;
	}
	get ccCreditoCCField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCierreCreditos')!;
	}
	get ccIntCorrienteField(): AbstractControl {
		return this.PaisForm.get('ctrCtaInteresCorriente')!;
	}
	//Fin Cuentas X Cobrar
	//Cuentas X pagar
	get cccpField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCuentasXPagar')!;
	}
	get cclpField(): AbstractControl {
		return this.PaisForm.get('ctrCtaLetraxPagar')!;
	}
	get ccProntoPagoCPField(): AbstractControl {
		return this.PaisForm.get('ctrCtaProntoPagoCP')!;
	}
	get ccGasComField(): AbstractControl {
		return this.PaisForm.get('ctrCtaComisiones')!;
	}
	get ccImpuesto1CPField(): AbstractControl {
		return this.PaisForm.get('ctrCtaImpuesto1CP')!;
	}
	get ccImpuesto2CPField(): AbstractControl {
		return this.PaisForm.get('ctrCtaImpuesto2CP')!;
	}
	get ccAnticipoCP(): AbstractControl {
		return this.PaisForm.get('ctrCtaAnticiposCP')!;
	}
	get ccDebitosCPField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCierreDebitosCP')!;
	}
	get ccCreditosCPField(): AbstractControl {
		return this.PaisForm.get('ctrCtaCierreCreditosCP')!;
	}

	//Fin Cuentas Por pagar

	//Otros
	get ccRubro1CCField(): AbstractControl {
		return this.PaisForm.get('Rubro1CC')!;
	}
	get ccRubro2CCField(): AbstractControl {
		return this.PaisForm.get('Rubro2CC')!;
	}
	get ccRubro1CPField(): AbstractControl {
		return this.PaisForm.get('Rubro1CP')!;
	}

	get ccRubro2CPField(): AbstractControl {
		return this.PaisForm.get('Rubro2CP')!;
	}
	get codigoISOField(): AbstractControl {
		return this.PaisForm.get('PaisISO')!;
	}
	get nombreField(): AbstractControl {
		return this.PaisForm.get('nombre')!;
	}
	//Fin Otros

	get codPaisField(): AbstractControl {
		return this.PaisForm.get('codPais')!;
	}
}
