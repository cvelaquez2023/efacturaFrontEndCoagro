/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	IResponseBeneficiario,
	IResponseCajaChica,
	IResponseCentroCosto,
	IResponseCentroCuenta,
	IResponseConceptoVale,
	IResponseDepartamento,
	IResponseDtesCp,
	IResponseSubTipo,
	IResponseValeCajachica
} from '@app/modules/ci/articulo/model/articulo-api-model-interface';
import { ArticuloApiService } from '@app/modules/ci/articulo/service/articulo-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { IResponseDTE14 } from '../../model/sujetoExcluido_DTE_interface';
import { SujetoexcluidoProveedorService } from '../../services/sujetoexcluido-proveedor.service';

@Component({
	selector: 'app-add-sujeto-excluido-ch',
	templateUrl: './add-sujeto-excluido-ch.component.html',
	styleUrls: ['./add-sujeto-excluido-ch.component.scss']
})
export class AddSujetoExcluidoCHComponent {
	formAplicarCh!: FormGroup;
	listCajaChica: IResponseCajaChica[] = [];
	listaVale: IResponseValeCajachica[] = [];
	listDepartamento: IResponseDepartamento[] = [];
	filterConcepto: IResponseConceptoVale[] = [];
	listConcepto: IResponseConceptoVale[] = [];
	listBeneficiario: IResponseBeneficiario[] = [];
	datoCp: IResponseDtesCp[] = [];
	listCentroCuenta: IResponseCentroCuenta[] = [];
	listCentroCosto: IResponseCentroCosto[] = [];
	listTipoDoc: IResponseSubTipo[] = [];

	saldo = 0;
	montop = 0;
	montol = 0;
	subtotal = 0;
	fovial = 0;
	cotrans = 0;
	iva = 0;
	total = 0;
	today = new Date();
	pipe = new DatePipe('en-US');
	emsion = '';
	btnAplicar = false;
	valeId = 0;
	_filtro: string = '';

	constructor(
		private _formBuider: FormBuilder,
		private _service: ArticuloApiService,
		private _sujetoExluidoApiService: SujetoexcluidoProveedorService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddSujetoExcluidoCHComponent>,
		private _snotifyService: SnotifyService
	) {
		this._loadFormGroup(),
			this._loadCajaChica(),
			this._loadDepartamento(),
			this._lodadConcepto(),
			this._lodadBeneficiario();
		this._loadDatos();
		this._loadCuentaContable();
	}
	private _loadFormGroup(): void {
		this.formAplicarCh = this._formBuider.group({
			cajachica: ['', [Validators.required]],
			saldo: [],
			vale: ['', [Validators.required]],
			departamento: ['', [Validators.required]],
			concepto: ['', [Validators.required]],
			beneficionario: ['', [Validators.required]],
			emision: [],
			montoprovision: [],
			montoliquidacion: [],
			//detalle 1
			fechadoc: [],
			tipoDoc: [],
			nit: [],
			impuesto: [],
			cuentaContable: ['', [Validators.required]],
			//detalle 2
			numeroDte: [],
			subtipoDoc: ['', [Validators.required]],
			proveedor: [],
			conceptod: ['', [Validators.required]],
			centrocosto: ['', [Validators.required]],
			//detalle 3
			subtotal: [],
			fovial: [],
			cotrans: [],
			iva: [],
			total: [],
			detalle: ['', [Validators.required]]
		});
	}
	private _loadDatos(): void {
		const d = new Date();
		const n = d.getFullYear();
		const hoy = this.pipe.transform(this.today, 'dd/MM/YYYY');
		this._service.getDteCp(this.editData.Dte_Id as number).subscribe({
			next: (response) => {
				this.datoCp = response.result;

				//datalle 1
				this.formAplicarCh.controls['fechadoc'].setValue(this.datoCp[0].fechaDoc);
				this.formAplicarCh.controls['tipoDoc'].setValue(this.datoCp[0].TipoDoc);
				this.formAplicarCh.controls['nit'].setValue(this.editData.Documento);
				this.formAplicarCh.controls['impuesto'].setValue(this.datoCp[0].codigoImpuesto);
				//detalle 2
				this.formAplicarCh.controls['numeroDte'].setValue(this.datoCp[0].dte);
				this.cargaSubtipo(this.datoCp[0].subTipoDoc);
				this.formAplicarCh.controls['proveedor'].setValue(this.datoCp[0].nombre);

				//this.formAplicarCh.controls['montoprovision'].setValue(this.datoCp[0].monto);
				this.formAplicarCh.controls['subtotal'].setValue(this.editData.montoTotal);
				this.formAplicarCh.controls['fovial'].setValue(this.datoCp[0].fovial);
				this.formAplicarCh.controls['cotrans'].setValue(this.datoCp[0].cotrans);
				this.formAplicarCh.controls['iva'].setValue(this.datoCp[0].impuesto1);
				this.formAplicarCh.controls['total'].setValue(this.editData.montoTotal);
				this.formAplicarCh.controls['detalle'].setValue(this.datoCp[0].selloRecibido);
				this.formAplicarCh.controls['emision'].setValue(this.editData.fechaemision);
			}
		});
	}

	onkey(event: any) {
		this.listCentroCuenta = this.filterCuenta(event.target.value);
		if (event.target.value == '') {
			this._loadCuentaContable();
		}
	}
	filterCuenta(value: string) {
		let filter = value.toLowerCase();
		return this.listCentroCuenta.filter((option: any) => option.DESCRIPCION.toLowerCase().includes(filter));
	}
	selectionConcepto(conpceto: any): void {
		this.formAplicarCh
			.get('cuentaContable')
			?.setValue(this.listConcepto.find((r) => r.CONCEPTO_VALE == conpceto.value)?.CUENTA_CONTABLE || '');

		const cuenta = this.CuentaContableField.value as string;

		this._loadCuentaContable2(cuenta);
	}

	private _loadCuentaContable2(cuentaContable: string): void {
		this._service.getCentroCuenta2(cuentaContable).subscribe({
			next: (response) => {
				this.listCentroCosto = response.result;
			}
		});
	}

	private _lodadConcepto(): void {
		this._service.getConcepto().subscribe({
			next: (response) => {
				this.listConcepto = response.result;
			}
		});
	}

	private cargaSubtipo(id: string): void {
		this._service.getSubTipoCp(id).subscribe({
			next: (response) => {
				console.log(response.result);
				this.listTipoDoc = response.result;
			}
		});
	}
	private _loadCuentaContable(): void {
		this._service.getCuentaContable().subscribe({
			next: (response) => {
				this.listCentroCuenta = response.result;
			}
		});
	}
	selectionCuentaContable(cuentaContable: any): void {
		this._loadCuentaContable2(cuentaContable.value);
	}

	updateSaldo(caja: any): void {
		this.formAplicarCh.get('saldo')?.setValue(this.listCajaChica.find((r) => r.CAJA_CHICA == caja)?.SALDO || 0);
		this._service.getVale(caja).subscribe({
			next: (response) => {
				this.listaVale = response.result;
			}
		});
	}

	updateVale(vale: any): void {
		this.formAplicarCh
			.get('departamento')
			?.setValue(this.listaVale.find((r) => r.CONSECUTIVO == vale)?.DEPARTAMENTO || '');
		this.formAplicarCh
			.get('concepto')
			?.setValue(this.listaVale.find((r) => r.CONSECUTIVO == vale)?.CONCEPTO_VALE || '');
		this.formAplicarCh
			.get('beneficionario')
			?.setValue(this.listaVale.find((r) => r.CONSECUTIVO == vale)?.BENEFICIARIO || '');
		//const fecha = this.listaVale.find((r) => r.CONSECUTIVO == vale)?.FECHA_EMISION || '';
		//const fechaformat = this.pipe.transform(fecha, 'dd/MM/YYY');
		//this.formAplicarCh.get('emision')?.setValue(fechaformat);
		this.formAplicarCh.get('montoprovision')?.setValue(this.editData.montoTotal);
		this.formAplicarCh
			.get('montoliquidacion')
			?.setValue(this.listaVale.find((r) => r.CONSECUTIVO == vale)?.MONTO_VALE || 0);

		const disponible = (this.montoprovisionField.value as number) - (this.montoliquidacionField.value as number);
		if (disponible < this.total) {
			this._snotifyService.error('El Monto de documento es mayor a lo Disponible', {
				position: SnotifyPosition.rightTop
			});
			//	this.btnAplicar = true;
			return;
		} else {
			this.btnAplicar = false;
		}
	}
	private _loadDepartamento(): void {
		this._service.getDepartamento().subscribe({
			next: (response) => {
				this.listDepartamento = response.result;
			}
		});
	}
	private _loadCajaChica(): void {
		this._service.getCajaChica().subscribe({
			next: (response) => {
				this.listCajaChica = response.result;
			}
		});
	}

	private _lodadBeneficiario(): void {
		this._service.getBeneficiario().subscribe({
			next: (response) => {
				this.listBeneficiario = response.result;
			}
		});
	}
	//Para enviar a caja chica primero enviamos a MH despues que todo fue exitoso con MH mandamos a Caja chica
	clickSave(): void {
		//1 Conseguimos de DTE
		if (this.formAplicarCh.invalid) {
			this._snotifyService.error('Todos los campos son obligatorios', { position: SnotifyPosition.rightTop });
			return;
		}
		const dte = this.dteField.value;
		const data: IResponseDTE14 = {
			tipoDocumento: '13',
			numDocumento: 'ND',
			nombre: 'ND',
			direccion: {
				departamento: 'ND',
				municipio: 'ND',
				complemento: 'ND'
			},
			telefono: 'ND',
			correo: 'ND',
			aplicacion: {
				descripcion: 'ND',
				monto: 0.0,
				renta: 0.0,
				total: 0.0,
				fecha: '1980-01-01',
				dte: dte
			},
			hacienda: 'S',
			origen: 'CH'
		};
		this.envioMH(data);
	}
	private envioMH(data: IResponseDTE14): void {
		this._sujetoExluidoApiService.postEnvioDTE(data).subscribe({
			next: (response) => {
				if (response.success === true) {
					//Enviamsos a guardar a Caja Chicca
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const selloRecibido = response.result;
					this.clickSave2(selloRecibido);
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error('El Envio Hacienda dio un Problema');
				}
			}
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	clickSave2(sello: string): void {
		const d = new Date();
		const n = d.getFullYear();
		const ano = n.toString();
		const vale = this.valeField.value as number;
		const conse = this.listaVale.find((r) => r.CONSECUTIVO == vale)?.CONSECUTIVO || 0;
		const deta = (this.detalleField.value as string) + ' //' + sello;
		const docsSoporte = {
			_vale: conse,
			_linea: 0,
			_centro_costo: this.CentroCostoField.value as string,
			_cuenta_contable: this.CuentaContableField.value as string,
			_nit: this.nitField.value as string,
			_doc_soporte: (this.dteField.value as string) + '-' + ano,
			_tipo: this.tipoDocField.value as string,
			_monto: this.totalField.value as number,
			_monot_vale: this.montoprovisionField.value as number,
			_concepto: this.conceptodField.value as string,
			_detalle: deta,
			_subtotal: this.subTotalField.value as number,
			_impuesto1: this.ivaField.value as number,
			_impuesto2: 0.0,
			_rubro1: this.fovialField.value as number,
			_rubro2: this.cotransField.value as number,
			_descuento: 0.0,
			_subtipo: this.subtipoDocField.value as number,
			_fecha: this.convertiFecha(this.emisionField.value as string),
			_fecha_rigue: this.convertiFecha(this.emisionField.value as string),
			_codigo_impuesto: this.impuestoField.value as string,
			_base_impuesto1: this.subTotalField.value as string,
			_base_impuesto2: 0.0,
			_id: this.editData.Dte_Id,
			_montoProvisional: this.montoprovisionField.value as number,
			_montoDefinitivo: this.montoliquidacionField.value as number
		};
		//guadarmos el detalle en doc_soporte
		this._service.posDocSoporte(docsSoporte).subscribe({
			next: (response) => {
				if (response.success) {
					this._snotifyService.success('Registro Guardado con Exito', {
						position: SnotifyPosition.rightTop
					});
					this.btnAplicar = true;
				}
			}
		});
	}

	cerrar(): void {
		this._dialogRef.close('updateCH');
	}
	private convertiFecha(string: any) {
		var fecha = string.split('/');
		return fecha[2] + '/' + fecha[1] + '/' + fecha[0];
	}

	get impuestoField(): AbstractControl {
		return this.formAplicarCh.get('impuesto')!;
	}
	get montopField(): AbstractControl {
		return this.formAplicarCh.get('montop')!;
	}
	get subtipoDocField(): AbstractControl {
		return this.formAplicarCh.get('subtipoDoc')!;
	}
	get fovialField(): AbstractControl {
		return this.formAplicarCh.get('fovial')!;
	}
	get cotransField(): AbstractControl {
		return this.formAplicarCh.get('cotrans')!;
	}
	get ivaField(): AbstractControl {
		return this.formAplicarCh.get('iva')!;
	}
	get subTotalField(): AbstractControl {
		return this.formAplicarCh.get('subtotal')!;
	}
	get totalField(): AbstractControl {
		return this.formAplicarCh.get('total')!;
	}
	get tipoDocField(): AbstractControl {
		return this.formAplicarCh.get('tipoDoc')!;
	}
	get MontoField(): AbstractControl {
		return this.formAplicarCh.get('monto')!;
	}
	get CuentaContableField(): AbstractControl {
		return this.formAplicarCh.get('cuentaContable')!;
	}
	get detalleField(): AbstractControl {
		return this.formAplicarCh.get('detalle')!;
	}
	get CentroCostoField(): AbstractControl {
		return this.formAplicarCh.get('centrocosto')!;
	}
	get departamentoField(): AbstractControl {
		return this.formAplicarCh.get('departamento')!;
	}
	get cajachicaField(): AbstractControl {
		return this.formAplicarCh.get('cajachica')!;
	}
	get consecutivoField(): AbstractControl {
		return this.formAplicarCh.get('consecutivo')!;
	}

	get emisionField(): AbstractControl {
		return this.formAplicarCh.get('emision')!;
	}

	get conceptoField(): AbstractControl {
		return this.formAplicarCh.get('concepto')!;
	}
	get conceptodField(): AbstractControl {
		return this.formAplicarCh.get('conceptod')!;
	}
	get beneficionarioField(): AbstractControl {
		return this.formAplicarCh.get('beneficionario')!;
	}
	get montoprovisionField(): AbstractControl {
		return this.formAplicarCh.get('montoprovision')!;
	}
	get montoliquidacionField(): AbstractControl {
		return this.formAplicarCh.get('montoliquidacion')!;
	}

	get saldoField(): AbstractControl {
		return this.formAplicarCh.get('saldo')!;
	}
	get nitField(): AbstractControl {
		return this.formAplicarCh.get('nit')!;
	}
	get dteField(): AbstractControl {
		return this.formAplicarCh.get('numeroDte')!;
	}
	get valeField(): AbstractControl {
		return this.formAplicarCh.get('vale')!;
	}
}
