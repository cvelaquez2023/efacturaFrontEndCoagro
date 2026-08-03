import { Iglobales_CI } from './../../../../model/globales_CI.interface';
import { ICreateGlobalesCI } from './../../service/parametros-ci-api-model-interface';
import { ParametrosCIApiService } from './../../service/parametros-ci-api.service';
import { SnotifyService } from 'ng-snotify';
import { FormControl, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
interface Food {
	value: string;
	viewValue: string;
}
// eslint-disable-next-line no-unused-labels

@Component({
	selector: 'app-parametros-modulo-page',
	templateUrl: './parametros-modulo-page.component.html',
	styleUrls: ['./parametros-modulo-page.component.scss']
})
export class ParametrosModuloPageComponent implements OnInit {
	globalesCI: ICreateGlobalesCI[] = [];
	globalesCIForm!: FormGroup;
	constructor(
		private _formBuilder: FormBuilder,
		private _snotifyService: SnotifyService,
		private _parametrosCIApiService: ParametrosCIApiService
	) {
		this._loadFormGroup();
	}

	ngOnInit(): void {
		this._loadGlobalesCI(1, 1);
	}

	private _loadFormGroup(): void {
		this.globalesCIForm = this._formBuilder.group({
			// eslint-disable-next-line no-useless-escape
			//Tab Generales
			costoDecimal: ['0', Validators.required],
			existenciaDecimal: ['0', Validators.required],
			pesoDecimal: ['0', Validators.required],
			costoFiscal: ['P', Validators.required], //pendiente
			costoCorporativo: ['U', Validators.required], //pendiente
			costoIngresoEspecial: ['P', Validators.required], //pendiente
			unidadPeso: ['', Validators.required],
			unidadVolumen: ['', Validators.required],
			cuarentena: ['', Validators.required], //pendiente
			disponible: ['', Validators.required], //pendiente
			reservada: ['', Validators.required], //pendiente
			vencida: ['', Validators.required], //pendiente
			nombreClasif1: ['', [Validators.required, Validators.maxLength(25)]],
			nombreClasif2: ['', [Validators.required, Validators.maxLength(25)]],
			nombreClasif3: ['', [Validators.required, Validators.maxLength(25)]],
			nombreClasif4: ['', [Validators.required, Validators.maxLength(25)]],
			nombreClasif5: ['', [Validators.required, Validators.maxLength(25)]],
			nombreClasif6: ['', [Validators.required, Validators.maxLength(25)]],
			//Fin
			//Tab Indicadores
			integracionCont: [false, Validators.required],
			usaLocalizaciones: [false, Validators.required],
			usaCodigoBarras: [false, Validators.required],
			usaAprobacion: [false, Validators.required],
			relaArticuloProveedor: [false, Validators.required], //pendiente
			resExistenciaDocumento: [false, Validators.required], //pendiente
			kits: [false, Validators.required], //pendiente
			redondearUnidadDetalle: [false, Validators.required], //pendiente
			transaccionesXUsuario: [false, Validators.required],
			UsaConsecutivosPorDocumento: [false, Validators.required],
			manejaEstandar: [false, Validators.required], //pendiente
			usaNumeroSerie: [false, Validators.required],
			lineaMaxTrans: ['', Validators.required],
			//Fin

			//Tab Contable
			paqueteId: ['', Validators.required],
			descripcionPaquete: [''],
			tipoAsientoId: ['', Validators.required],
			descripcionAsiento: [''],
			generacionAsientoVisual: [false, Validators.required], //pendiente
			generacionAsientoModificar: [false, Validators.required], //pendiente
			generacionAsientoAplicar: [false, Validators.required], //pendiente

			//Fin
			//Tab Ajuste
			asntAjuCompras: [false, Validators.required],
			asntAjuConsumo: [false, Validators.required],
			asntAjuCosto: [false, Validators.required],
			asntAjuFisico: [false, Validators.required],
			asntAjuMiscelan: [false, Validators.required],
			asntAjuProduc: [false, Validators.required],
			asntAjuVencim: [false, Validators.required],
			asntAjuVent: [false, Validators.required],
			ctrEnTransaccion: [false, Validators.required],
			//Fin
			//Tab Codigo Barras
			unidadesDeDistribucion: [false, Validators.required],
			asistenciaAutomatica: [false, Validators.required],
			usaCodigoEAN13: [false, Validators.required],
			EAN13ReglaLocal: ['', Validators.required],
			usaCodigoEAN8: [false, Validators.required],
			usaCodigoUCC12: ['', Validators.required],
			UCC12ReglaLocal: ['', Validators.required],
			usaCodigoUCC8: ['', Validators.required],
			EAN18ReglaLocal: ['', Validators.required],
			usaCodigoGeneric: ['', Validators.required],
			modalidadUso: ['', Validators.required],
			usaConsecutivos: ['', Validators.required],
			usaUnidadDistr: ['', Validators.required],
			prioridadBusqueda: ['', Validators.required]
			//Fin
		});

		if (this.globalesCI.length === 0) {
			console.log('mayor a cero');
		} else {
			console.log('mayor a cero');
		}
	}

	disableSelect = new FormControl(false);

	private _loadGlobalesCI(page: number, rows: number): void {
		this._parametrosCIApiService.getGlobalesCI(page, rows).subscribe({
			next: (response) => {
				this.globalesCI = response.result;
			},
			error: () => {
				console.log('error');
			}
		});
	}

	save(): void {
		/* 		const datos: Iglobales_CI = {
			//Tab Generales
			CostosDec: this.costoDecimalField.value as number,
			ExistenciasDec: this.existenciaDecimalField.value as number,
			PesosDec: this.pesoDecimalField.value as number,
			
			UnidadPeso: this.unidadPesoField.value as string,
			UnidadVolumen: this.unidadVolumenField.value as string,
			UsaLocalizacion: this.usaLocalizacionesField.value as boolean,
			AjustarConteo: this.AjustarConteoField.value as boolean
		}; */
		console.log('Guardar');
	}

	//Tab General
	get costoDecimalField(): AbstractControl {
		return this.globalesCIForm.get('costoDecimal')!;
	}
	get existenciaDecimalField(): AbstractControl {
		return this.globalesCIForm.get('existenciaDecimal')!;
	}
	get pesoDecimalField(): AbstractControl {
		return this.globalesCIForm.get('pesoDecimal')!;
	}
	get costoFiscalField(): AbstractControl {
		return this.globalesCIForm.get('costoFiscal')!;
	}
	get costoCorporativoField(): AbstractControl {
		return this.globalesCIForm.get('costoCorporativo')!;
	}

	get costoIngresoEspecialField(): AbstractControl {
		return this.globalesCIForm.get('costoIngresoEspecial')!;
	}

	get unidadPesoField(): AbstractControl {
		return this.globalesCIForm.get('unidadPeso')!;
	}
	get unidadVolumenField(): AbstractControl {
		return this.globalesCIForm.get('unidadVolumen')!;
	}

	get cuarentenaField(): AbstractControl {
		return this.globalesCIForm.get('cuarentena')!;
	}

	get disponibleField(): AbstractControl {
		return this.globalesCIForm.get('disponible')!;
	}

	get reservadaField(): AbstractControl {
		return this.globalesCIForm.get('reservada')!;
	}
	get vencidadField(): AbstractControl {
		return this.globalesCIForm.get('vencidad')!;
	}

	get nombreClasif1Field(): AbstractControl {
		return this.globalesCIForm.get('nombreClasif1')!;
	}
	get nombreClasif12Field(): AbstractControl {
		return this.globalesCIForm.get('nombreClasif2')!;
	}
	get nombreClasif3Field(): AbstractControl {
		return this.globalesCIForm.get('nombreClasif3')!;
	}
	get nombreClasif4Field(): AbstractControl {
		return this.globalesCIForm.get('nombreClasif4')!;
	}
	get nombreClasif5Field(): AbstractControl {
		return this.globalesCIForm.get('nombreClasif5')!;
	}
	get nombreClasif6Field(): AbstractControl {
		return this.globalesCIForm.get('nombreClasif6')!;
	}
	//Fin Tab
	//Tag Indicadores
	get integracionContField(): AbstractControl {
		return this.globalesCIForm.get('integracionCont')!;
	}
	get usaLocalizacionesField(): AbstractControl {
		return this.globalesCIForm.get('usaLocalizaciones')!;
	}
	get usaCodigoBarrasField(): AbstractControl {
		return this.globalesCIForm.get('usaCodigoBarras')!;
	}
	get usarAprobacionField(): AbstractControl {
		return this.globalesCIForm.get('usarAprobacion')!;
	}

	get relaArticuloProveedorField(): AbstractControl {
		return this.globalesCIForm.get('relaArticuloProveedor')!;
	}

	get resExistenciaDocumentoField(): AbstractControl {
		return this.globalesCIForm.get('resExistenciaDocumento')!;
	}

	get kitsField(): AbstractControl {
		return this.globalesCIForm.get('kits')!;
	}

	get redondearUnidadDetalleField(): AbstractControl {
		return this.globalesCIForm.get('redondearUnidadDetalle')!;
	}

	get UsaConsecutivosPorDocumentoField(): AbstractControl {
		return this.globalesCIForm.get('UsaConsecutivosPorDocumento')!;
	}

	get transacXusuarioField(): AbstractControl {
		return this.globalesCIForm.get('transacXusuario')!;
	}

	get manejaEstandarField(): AbstractControl {
		return this.globalesCIForm.get('manejaEstandar')!;
	}

	get usarNumeroSerieField(): AbstractControl {
		return this.globalesCIForm.get('usarNumeroSerie')!;
	}

	get lienaMaxTransField(): AbstractControl {
		return this.globalesCIForm.get('lienaMaxTrans')!;
	}

	get tipoAsientoIdField(): AbstractControl {
		return this.globalesCIForm.get('tipoAsientoId')!;
	}

	get paqueteIdField(): AbstractControl {
		return this.globalesCIForm.get('paqueteId')!;
	}

	get generacionAsientoVisualField(): AbstractControl {
		return this.globalesCIForm.get('generacionAsientoVisual')!;
	}
	get generacionAsientoModificarField(): AbstractControl {
		return this.globalesCIForm.get('generacionAsientoModificar')!;
	}
	get generacionAsientoAplicarField(): AbstractControl {
		return this.globalesCIForm.get('generacionAsientoAplicar')!;
	}
	//Fin

	//Tab Ajustes

	get asntAjuVentField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuVent')!;
	}

	get astnAjuFisicoField(): AbstractControl {
		return this.globalesCIForm.get('astnAjuFisico')!;
	}

	get asntAjuConsumoField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuConsumo')!;
	}

	get AjustarConteoField(): AbstractControl {
		return this.globalesCIForm.get('AjustarConteo')!;
	}
	get maxAuditoriaField(): AbstractControl {
		return this.globalesCIForm.get('maxAuditoria')!;
	}
	get asntAjuComprasField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuCompras')!;
	}

	get asntAjuCostoField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuCosto')!;
	}

	get asntAjuMiscelanField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuMiscelan')!;
	}
	get asntAjuProducField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuProduc')!;
	}
	get asntAjuVencimField(): AbstractControl {
		return this.globalesCIForm.get('asntAjuVencim')!;
	}

	get ctrEnTransaccionField(): AbstractControl {
		return this.globalesCIForm.get('ctrEnTransaccion')!;
	}

	get existEnTotalesField(): AbstractControl {
		return this.globalesCIForm.get('existEnTotales')!;
	}
	get fchUltProcAproField(): AbstractControl {
		return this.globalesCIForm.get('fchUltProcApro')!;
	}
	get fchUltProcVctoField(): AbstractControl {
		return this.globalesCIForm.get('fchUltProcVcto')!;
	}
	get fechaInicioTrans(): AbstractControl {
		return this.globalesCIForm.get('fechaInicioTrans')!;
	}

	get modAplicAsientoField(): AbstractControl {
		return this.globalesCIForm.get('modAplicAsiento')!;
	}

	get asistenciaAutomaticaField(): AbstractControl {
		return this.globalesCIForm.get('asistenciaAutomatica')!;
	}

	get cntrlSeriesEntrField(): AbstractControl {
		return this.globalesCIForm.get('cntrlSeriesEntr')!;
	}
	get EAN13ReglaLocalField(): AbstractControl {
		return this.globalesCIForm.get('EAN13ReglaLocal')!;
	}
	get EAN18ReglaLocalField(): AbstractControl {
		return this.globalesCIForm.get('EAN18ReglaLocal')!;
	}

	get modalidadUsoField(): AbstractControl {
		return this.globalesCIForm.get('modalidadUso')!;
	}
	get prioridadBusquedaField(): AbstractControl {
		return this.globalesCIForm.get('prioridadBusqueda')!;
	}

	get UCC12ReglaLocalField(): AbstractControl {
		return this.globalesCIForm.get('UCC12ReglaLocal')!;
	}

	get usaCodigoEAN13Field(): AbstractControl {
		return this.globalesCIForm.get('usaCodigoEAN13')!;
	}
	get usaCodigoEAN8Field(): AbstractControl {
		return this.globalesCIForm.get('usaCodigoEAN8')!;
	}
	get usaCodigoGenericField(): AbstractControl {
		return this.globalesCIForm.get('usaCodigoGeneric')!;
	}
	get usaCodigoUCC12Field(): AbstractControl {
		return this.globalesCIForm.get('usaCodigoUCC12')!;
	}
	get usaCodigoUCC8Field(): AbstractControl {
		return this.globalesCIForm.get('usaCodigoUCC8')!;
	}
	get usaConsecutivosField(): AbstractControl {
		return this.globalesCIForm.get('usaConsecutivos')!;
	}
	get usaUnidadDistrField(): AbstractControl {
		return this.globalesCIForm.get('usaUnidadDistr')!;
	}
}
