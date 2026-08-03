/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaArticuloApiService } from '../../service/categoria-articulo-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CentroCuentaApiService } from '@app/modules/cg/administracion/centrocuenta/services/centro-cuenta-api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IResponseCentroCuenta } from '@app/modules/cg/administracion/centrocuenta/model/centroCuenta-api-model-interface';
import { ICreateCategoriaArticulo } from '../../service/categoria-articulo-api-model-interface';

@Component({
	selector: 'app-add-cat-articulo-page',
	templateUrl: './add-cat-articulo-page.component.html',
	styleUrls: ['./add-cat-articulo-page.component.scss']
})
export class AddCatArticuloPageComponent {
	constructor(
		private _formBuilder: FormBuilder,
		private _categoriaApiService: CategoriaArticuloApiService,
		private _snotifyService: SnotifyService,
		private _centroCuentaApiService: CentroCuentaApiService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddCatArticuloPageComponent>
	) {
		this._loadFormulario(), this._loadCentroCuenta(1, 100000);
	}
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	disableButtonSave = false;
	formCategoriaArticulo!: FormGroup;
	listCentroCuenta: IResponseCentroCuenta[] = [];
	private _loadFormulario(): void {
		this.formCategoriaArticulo = this._formBuilder.group({
			categoria: ['', [Validators.required, Validators.maxLength(10)]],
			nombre: ['', [Validators.required, Validators.maxLength(100)]],
			//Tab Generales
			CtrCtaInventarioId: [null],
			CtrCtaVariacionCostoId: [null],
			CtrCtaFaltanteInvFisicoId: [null],
			CtrCtaSobranteInvFisicoId: [null],
			CtrCtaVencimientoId: [null],
			CtrCtaAjusteId: [null],
			CtrCtaAjusteCMVId: [null],
			//Tab Local
			CtrCtaVentasLocId: [null],
			CtrCtaVentasExentasLocId: [null],
			CtrCtaDevSobreVtasLocId: [null],
			CtrCtaDescVentaLocId: [null],
			CtrCtaCostoVentaLocId: [null],
			CtrCtaDescPorLineaLocId: [null],
			CtrCtaCostoDescuentoLocId: [null],
			CtrCtaComisionVentasLocId: [null],
			CtrCtaComisionCobroLocId: [null],
			CtrCtaComprasLocId: [null],
			CtrCtaDesBonificacionLocId: [null],
			CtrCtaRetencionAsumCompraLocId: [null],
			//Tab Exterior
			CtrCtaVentasExtId: [null],
			CtrCtaVentasExentasExtId: [null],
			CtrCtaDevSobreVtasExtId: [null],
			CtrCtaDescVentaExtId: [null],
			CtrCtaCostoVentaExtId: [null],
			CtrCtaDescPorLineaExtId: [null],
			CtrCtaCostoDescuentoExtId: [null],
			CtrCtaComisionVentasExtId: [null],
			CtrCtaComisionCobroExtId: [null],
			CtrCtaComprasExtId: [null],
			CtrCtaDesBonificacionExtId: [null],
			//Tab Comsuno
			CtrCtaMaterialEnProcId: [null],
			CtrCtaConsumoNormalId: [null],
			CtrCtaConsumoRetrabajoId: [null],
			CtrCtaConsumoGastoId: [null],
			CtrCtaConsumoDesperdicioId: [null],
			CtrCtaMaterialAplicadosId: [null],
			//Remisiones
			CtrCtaRemisionesSobranteId: [null],
			CtrCtaRemisionesFaltanteId: [null]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';
			this.formCategoriaArticulo.controls['categoria'].setValue(this.editData.codCategoriaArticulo);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.formCategoriaArticulo.controls['nombre'].setValue(this.editData.descripcion);
			//Tab Generales
			this.formCategoriaArticulo.controls['CtrCtaInventarioId'].setValue(this.editData.ctrCtaInventarioId);
			this.formCategoriaArticulo.controls['CtrCtaVariacionCostoId'].setValue(this.editData.ctrCtaVariaCostoId);
			this.formCategoriaArticulo.controls['CtrCtaFaltanteInvFisicoId'].setValue(this.editData.ctrCtaFaltInventFisId);
			this.formCategoriaArticulo.controls['CtrCtaSobranteInvFisicoId'].setValue(this.editData.ctrCtaSobrInventFisId);
			this.formCategoriaArticulo.controls['CtrCtaVencimientoId'].setValue(this.editData.ctrCtaVencimientoId);
			this.formCategoriaArticulo.controls['CtrCtaAjusteId'].setValue(this.editData.ctrCtaAjuId);
			this.formCategoriaArticulo.controls['CtrCtaAjusteCMVId'].setValue(this.editData.ctrCtaAjuCMVId);
			//Tab Local
			this.formCategoriaArticulo.controls['CtrCtaVentasLocId'].setValue(this.editData.ctrCtaVentasLocId);
			this.formCategoriaArticulo.controls['CtrCtaVentasExentasLocId'].setValue(this.editData.ctrCtaVentasExenLocId);
			this.formCategoriaArticulo.controls['CtrCtaDevSobreVtasLocId'].setValue(this.editData.ctrCtaDevVentasLocId);
			this.formCategoriaArticulo.controls['CtrCtaDescVentaLocId'].setValue(this.editData.ctrCtaDescVentaLocId);
			this.formCategoriaArticulo.controls['CtrCtaCostoVentaLocId'].setValue(this.editData.ctrCtaCostVentaLocId);
			this.formCategoriaArticulo.controls['CtrCtaDescPorLineaLocId'].setValue(this.editData.ctrCtaDescLineaLocId);
			this.formCategoriaArticulo.controls['CtrCtaCostoDescuentoLocId'].setValue(this.editData.ctrCtaCostDescLocId);
			this.formCategoriaArticulo.controls['CtrCtaComisionVentasLocId'].setValue(this.editData.ctrCtaComsVentaLocId);
			this.formCategoriaArticulo.controls['CtrCtaComisionCobroLocId'].setValue(this.editData.ctrCtaComsCobroLocId);
			this.formCategoriaArticulo.controls['CtrCtaComprasLocId'].setValue(this.editData.ctrCtaCompraLocId);
			this.formCategoriaArticulo.controls['CtrCtaDesBonificacionLocId'].setValue(this.editData.ctrCtaDescBonifLocId);
			this.formCategoriaArticulo.controls['CtrCtaRetencionAsumCompraLocId'].setValue(this.editData.ctrCtaRetAsumId);
			//Tab Exterior
			this.formCategoriaArticulo.controls['CtrCtaVentasExtId'].setValue(this.editData.ctrCtaVentasExpId);
			this.formCategoriaArticulo.controls['CtrCtaVentasExentasExtId'].setValue(this.editData.ctrCtaVentasExenExpId);
			this.formCategoriaArticulo.controls['CtrCtaDevSobreVtasExtId'].setValue(this.editData.ctrCtaDevVentasExpId);
			this.formCategoriaArticulo.controls['CtrCtaDescVentaExtId'].setValue(this.editData.ctrCtaDescVentaExpId);
			this.formCategoriaArticulo.controls['CtrCtaCostoVentaExtId'].setValue(this.editData.ctrCtaCostVentaExpId);
			this.formCategoriaArticulo.controls['CtrCtaDescPorLineaExtId'].setValue(this.editData.ctrCtaDescLineaExpId);
			this.formCategoriaArticulo.controls['CtrCtaCostoDescuentoExtId'].setValue(this.editData.ctrCtaCostDescExpId);
			this.formCategoriaArticulo.controls['CtrCtaComisionVentasExtId'].setValue(this.editData.ctrCtaComsVentaExpId);
			this.formCategoriaArticulo.controls['CtrCtaComisionCobroExtId'].setValue(this.editData.ctrCtaComsCobroExpId);
			this.formCategoriaArticulo.controls['CtrCtaComprasExtId'].setValue(this.editData.ctrCtaCompraImpId);
			this.formCategoriaArticulo.controls['CtrCtaDesBonificacionExtId'].setValue(this.editData.ctrCtaDescBonifExpId);
			//Tab Comsuno
			this.formCategoriaArticulo.controls['CtrCtaMaterialEnProcId'].setValue(this.editData.ctrCtaMatProcesoId);
			this.formCategoriaArticulo.controls['CtrCtaConsumoNormalId'].setValue(this.editData.ctrCtaConsNormalId);
			this.formCategoriaArticulo.controls['CtrCtaConsumoRetrabajoId'].setValue(this.editData.ctrCtaConsRetrabajoId);
			this.formCategoriaArticulo.controls['CtrCtaConsumoGastoId'].setValue(this.editData.ctrCtaConsGastoId);
			this.formCategoriaArticulo.controls['CtrCtaConsumoDesperdicioId'].setValue(this.editData.ctrCtaConsDesperdicId);
			this.formCategoriaArticulo.controls['CtrCtaMaterialAplicadosId'].setValue(this.editData.ctrCtaMatAplicadosId);
			//Remisiones
			this.formCategoriaArticulo.controls['CtrCtaRemisionesSobranteId'].setValue(this.editData.ctrCtaSobranteRemisId);
			this.formCategoriaArticulo.controls['CtrCtaRemisionesFaltanteId'].setValue(this.editData.ctrCtaFaltanteRemisId);
		}
	}
	onclickCategoria(): void {
		if (this.formCategoriaArticulo.invalid) {
			return;
		}
		if (!this.editData) {
			const sendData: ICreateCategoriaArticulo = {
				codCategoriaArticulo: this.categoriaFiel.value as string,
				descripcion: this.nombreFiel.value as string,
				//tab Genrealaes
				ctrCtaInventarioId: this.CtrCtaInventarioIdFiel.value as number,
				ctrCtaVariaCostoId: this.CtrCtaVariacionCostoIdFiel.value as number,
				ctrCtaFaltInventFisId: this.CtrCtaFaltanteInvFisicoIdFiel.value as number,
				ctrCtaSobrInventFisId: this.CtrCtaSobranteInvFisicoIdFiel.value as number,
				ctrCtaVencimientoId: this.CtrCtaVencimientoIdFiel.value as number,
				ctrCtaAjuId: this.CtrCtaAjusteIdFiel.value as number,
				ctrCtaAjuCMVId: this.CtrCtaAjusteCMVIdFiel.value as number,
				//Local
				ctrCtaVentasLocId: this.CtrCtaVentasLocIdFiel.value as number,
				ctrCtaVentasExenLocId: this.CtrCtaVentasExentasLocIdFiel.value as number,
				ctrCtaDevVentasLocId: this.CtrCtaDevSobreVtasLocIdFiel.value as number,
				ctrCtaDescVentaLocId: this.CtrCtaDescVentaLocIdFiel.value as number,
				ctrCtaCostVentaLocId: this.CtrCtaCostoVentaLocIdFiel.value as number,
				ctrCtaDescLineaLocId: this.CtrCtaDescPorLineaLocIdFiel.value as number,
				ctrCtaCostDescLocId: this.CtrCtaCostoDescuentoLocIdFiel.value as number,
				ctrCtaComsVentaLocId: this.CtrCtaComisionVentasLocIdFiel.value as number,
				ctrCtaComsCobroLocId: this.CtrCtaComisionCobroLocIdFiel.value as number,
				ctrCtaCompraLocId: this.CtrCtaComprasLocIdFiel.value as number,
				ctrCtaDescBonifLocId: this.CtrCtaDesBonificacionLocIdFiel.value as number,
				CtrCtaRetAsumId: this.CtrCtaRetencionAsumCompraLocIdFiel.value as number,
				//Exterior
				ctrCtaVentasExpId: this.CtrCtaVentasExtIdFiel.value as number,
				ctrCtaVentasExenExpId: this.CtrCtaVentasExentasExtIdFiel.value as number,
				ctrCtaDevVentasExpId: this.CtrCtaDevSobreVtasExtIdFiel.value as number,
				ctrCtaDescVentaExpId: this.CtrCtaDescVentaExtIdFiel.value as number,
				ctrCtaCostVentaExpId: this.CtrCtaCostoVentaExtIdFiel.value as number,
				ctrCtaDescLineaExpId: this.CtrCtaDescPorLineaExtIdFiel.value as number,
				ctrCtaCostDescExpId: this.CtrCtaCostoDescuentoExtIdFiel.value as number,
				ctrCtaComsVentaExpId: this.CtrCtaComisionVentasExtIdFiel.value as number,
				ctrCtaComsCobroExpId: this.CtrCtaComisionCobroExtIdFiel.value as number,
				ctrCtaCompraImpId: this.CtrCtaComprasExtIdFiel.value as number,
				ctrCtaDescBonifExpId: this.CtrCtaDesBonificacionExtIdFiel.value as number,
				//Consumo
				ctrCtaMatProcesoId: this.CtrCtaMaterialEnProcIdFiel.value as number,
				ctrCtaConsNormalId: this.CtrCtaConsumoNormalIdFiel.value as number,
				ctrCtaConsRetrabajoId: this.CtrCtaConsumoRetrabajoIdFiel.value as number,
				ctrCtaConsGastoId: this.CtrCtaConsumoGastoIdFiel.value as number,
				ctrCtaConsDesperdicId: this.CtrCtaConsumoDesperdicioIdFiel.value as number,
				ctrCtaMatAplicadosId: this.CtrCtaMaterialAplicadosIdFiel.value as number,
				//Remisiones
				ctrCtaSobranteRemisId: this.CtrCtaRemisionesSobranteIdFiel.value as number,
				ctrCtaFaltanteRemisId: this.CtrCtaRemisionesFaltanteIdFiel.value as number
			};
			this._save(sendData);
		} else {
			const sendData: ICreateCategoriaArticulo = {
				codCategoriaArticulo: this.categoriaFiel.value as string,
				descripcion: this.nombreFiel.value as string,
				//tab Genrealaes
				ctrCtaInventarioId: this.CtrCtaInventarioIdFiel.value as number,
				ctrCtaVariaCostoId: this.CtrCtaVariacionCostoIdFiel.value as number,
				ctrCtaFaltInventFisId: this.CtrCtaFaltanteInvFisicoIdFiel.value as number,
				ctrCtaSobrInventFisId: this.CtrCtaSobranteInvFisicoIdFiel.value as number,
				ctrCtaVencimientoId: this.CtrCtaVencimientoIdFiel.value as number,
				ctrCtaAjuId: this.CtrCtaAjusteIdFiel.value as number,
				ctrCtaAjuCMVId: this.CtrCtaAjusteCMVIdFiel.value as number,
				//Local
				ctrCtaVentasLocId: this.CtrCtaVentasLocIdFiel.value as number,
				ctrCtaVentasExenLocId: this.CtrCtaVentasExentasLocIdFiel.value as number,
				ctrCtaDevVentasLocId: this.CtrCtaDevSobreVtasLocIdFiel.value as number,
				ctrCtaDescVentaLocId: this.CtrCtaDescVentaLocIdFiel.value as number,
				ctrCtaCostVentaLocId: this.CtrCtaCostoVentaLocIdFiel.value as number,
				ctrCtaDescLineaLocId: this.CtrCtaDescPorLineaLocIdFiel.value as number,
				ctrCtaCostDescLocId: this.CtrCtaCostoDescuentoLocIdFiel.value as number,
				ctrCtaComsVentaLocId: this.CtrCtaComisionVentasLocIdFiel.value as number,
				ctrCtaComsCobroLocId: this.CtrCtaComisionCobroLocIdFiel.value as number,
				ctrCtaCompraLocId: this.CtrCtaComprasLocIdFiel.value as number,
				ctrCtaDescBonifLocId: this.CtrCtaDesBonificacionLocIdFiel.value as number,
				CtrCtaRetAsumId: this.CtrCtaRetencionAsumCompraLocIdFiel.value as number,
				//Exterior
				ctrCtaVentasExpId: this.CtrCtaVentasExtIdFiel.value as number,
				ctrCtaVentasExenExpId: this.CtrCtaVentasExentasExtIdFiel.value as number,
				ctrCtaDevVentasExpId: this.CtrCtaDevSobreVtasExtIdFiel.value as number,
				ctrCtaDescVentaExpId: this.CtrCtaDescVentaExtIdFiel.value as number,
				ctrCtaCostVentaExpId: this.CtrCtaCostoVentaExtIdFiel.value as number,
				ctrCtaDescLineaExpId: this.CtrCtaDescPorLineaExtIdFiel.value as number,
				ctrCtaCostDescExpId: this.CtrCtaCostoDescuentoExtIdFiel.value as number,
				ctrCtaComsVentaExpId: this.CtrCtaComisionVentasExtIdFiel.value as number,
				ctrCtaComsCobroExpId: this.CtrCtaComisionCobroExtIdFiel.value as number,
				ctrCtaCompraImpId: this.CtrCtaComprasExtIdFiel.value as number,
				ctrCtaDescBonifExpId: this.CtrCtaDesBonificacionExtIdFiel.value as number,
				//Consumo
				ctrCtaMatProcesoId: this.CtrCtaMaterialEnProcIdFiel.value as number,
				ctrCtaConsNormalId: this.CtrCtaConsumoNormalIdFiel.value as number,
				ctrCtaConsRetrabajoId: this.CtrCtaConsumoRetrabajoIdFiel.value as number,
				ctrCtaConsGastoId: this.CtrCtaConsumoGastoIdFiel.value as number,
				ctrCtaConsDesperdicId: this.CtrCtaConsumoDesperdicioIdFiel.value as number,
				ctrCtaMatAplicadosId: this.CtrCtaMaterialAplicadosIdFiel.value as number,
				//Remisiones
				ctrCtaSobranteRemisId: this.CtrCtaRemisionesSobranteIdFiel.value as number,
				ctrCtaFaltanteRemisId: this.CtrCtaRemisionesFaltanteIdFiel.value as number
			};
			this._edit(sendData);
		}
	}

	private _edit(data: ICreateCategoriaArticulo): void {
		this._categoriaApiService.updateCategoria(this.editData.id as number, data).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCategoriaArticulo.reset();
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

	private _save(data: ICreateCategoriaArticulo): void {
		this._categoriaApiService.createCatArticulo(data).subscribe({
			next: (response) => {
				if (response.success) {
					this.formCategoriaArticulo.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
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
	get categoriaFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('categoria')!;
	}
	get nombreFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('nombre')!;
	}
	//Tab Generales
	get CtrCtaInventarioIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaInventarioId')!;
	}
	get CtrCtaVariacionCostoIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaVariacionCostoId')!;
	}
	get CtrCtaFaltanteInvFisicoIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaFaltanteInvFisicoId')!;
	}
	get CtrCtaSobranteInvFisicoIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaSobranteInvFisicoId')!;
	}
	get CtrCtaVencimientoIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaVencimientoId')!;
	}
	get CtrCtaAjusteIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaAjusteId')!;
	}
	get CtrCtaAjusteCMVIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaAjusteCMVId')!;
	}
	//Tab Local
	get CtrCtaVentasLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaVentasLocId')!;
	}
	get CtrCtaVentasExentasLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaVentasExentasLocId')!;
	}
	get CtrCtaDevSobreVtasLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDevSobreVtasLocId')!;
	}
	get CtrCtaDescVentaLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDescVentaLocId')!;
	}
	get CtrCtaCostoVentaLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaCostoVentaLocId')!;
	}
	get CtrCtaDescPorLineaLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDescPorLineaLocId')!;
	}
	get CtrCtaCostoDescuentoLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaCostoDescuentoLocId')!;
	}
	get CtrCtaComisionVentasLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaComisionVentasLocId')!;
	}
	get CtrCtaComisionCobroLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaComisionCobroLocId')!;
	}
	get CtrCtaComprasLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaComprasLocId')!;
	}
	get CtrCtaDesBonificacionLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDesBonificacionLocId')!;
	}
	get CtrCtaRetencionAsumCompraLocIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaRetencionAsumCompraLocId')!;
	}
	//Tab Exterior
	get CtrCtaVentasExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaVentasExtId')!;
	}
	get CtrCtaVentasExentasExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaVentasExentasExtId')!;
	}
	get CtrCtaDevSobreVtasExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDevSobreVtasExtId')!;
	}
	get CtrCtaDescVentaExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDescVentaExtId')!;
	}
	get CtrCtaCostoVentaExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaCostoVentaExtId')!;
	}
	get CtrCtaDescPorLineaExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDescPorLineaExtId')!;
	}
	get CtrCtaCostoDescuentoExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaCostoDescuentoExtId')!;
	}
	get CtrCtaComisionVentasExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaComisionVentasExtId')!;
	}
	get CtrCtaComisionCobroExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaComisionCobroExtId')!;
	}
	get CtrCtaComprasExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaComprasExtId')!;
	}
	get CtrCtaDesBonificacionExtIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaDesBonificacionExtId')!;
	}
	//Tab Comsuno
	get CtrCtaMaterialEnProcIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaMaterialEnProcId')!;
	}
	get CtrCtaConsumoNormalIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaConsumoNormalId')!;
	}
	get CtrCtaConsumoRetrabajoIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaConsumoRetrabajoId')!;
	}
	get CtrCtaConsumoGastoIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaConsumoGastoId')!;
	}
	get CtrCtaConsumoDesperdicioIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaConsumoDesperdicioId')!;
	}
	get CtrCtaMaterialAplicadosIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaMaterialAplicadosId')!;
	}
	//Remisiones
	get CtrCtaRemisionesSobranteIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaRemisionesSobranteId')!;
	}
	get CtrCtaRemisionesFaltanteIdFiel(): AbstractControl {
		return this.formCategoriaArticulo.get('CtrCtaRemisionesFaltanteId')!;
	}
}
