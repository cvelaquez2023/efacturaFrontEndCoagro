import { Iglobales_CI } from './../../../../model/globales_CI.interface';
import { selectListGlobalesCI } from './../../../../store/ci.selectors';
import { selectListLote } from './../../../../lote/store/lote.selectors';
import { loadLoteAccion } from './../../../../lote/store/lote.actions';
import { loadExistenciaBodega } from './../../../../../as/tablas/otros/bodega/store/existenciaBodega/existenciaBodega.actions';
import { selectListExistenciaBodega } from './../../../../../as/tablas/otros/bodega/store/existenciaBodega/existenciaBodega.selectors';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CurrencyPipe } from '@angular/common';
import { AddLotePageComponent } from './../../../../lote/add-lote-page/add-lote-page.component';
import { ICrearDocumnetoInvDet } from './../../model/documentoInvDet-api-model-interface';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';

import { DocumentoInvEncaApiService } from './../../service/documentoInvEnca-api.service';
import { DocumentoInvDetApiService } from './../../service/documentoInvDet-api.service';
/* eslint-disable ngrx/avoid-dispatching-multiple-actions-sequentially */
import { loadLocalizacionAccion } from './../../../../../as/tablas/otros/bodega/store/localizaciones/loc.actions';
import { loadBodegaAccion } from './../../../../../as/tablas/otros/bodega/store/bodega.actions';
import { loadArticuloAccion } from './../../../../articulo/store/articulo.actions';
import { loadGlobalesCI } from './../../../../store/ci.actions';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ICrearDocumnetoInvEnca } from './../../model/documentoInvEnca-api-model-interface';
import { IResponseExistenciaLote } from './../../../../lote/model/existenciaLote-interface';
import { ExistenciaLoteApiService } from './../../../../lote/service/existenciaLote-api.service';
import { IResponseConsultarArticuloBodega } from './../../../../../as/tablas/otros/bodega/service/existenciaBodega-api-model-interface';
import { ExistenciaBodegaApiService } from './../../../../../as/tablas/otros/bodega/service/existenciaBodega-api.service';
import { selectListLocalizacion } from './../../../../../as/tablas/otros/bodega/store/localizaciones/loc.selectors';
import { IResponseAjusteSubSubTipo } from './../../../../administracion/transacciones-configurables/model/ajusteSubSubTipo-model-interface';
import { IResponseAjusteSubTipo } from './../../../../administracion/transacciones-configurables/model/ajusteSubTipo-model-interface';
import { AjusteSubSubTipoApiService } from './../../../../administracion/transacciones-configurables/service/ajusteSubSubTipo-api.service';
import { AjusteSubtipoApiService } from './../../../../administracion/transacciones-configurables/service/ajusteSubtipo-api.service';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { selectListBodega } from './../../../../../as/tablas/otros/bodega/store/bodega.selectors';
import { AppState } from '@app/config/app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	IResponseLocaizacionBodega,
	IResponseBodega
} from './../../../../../as/tablas/otros/bodega/service/bodega-api-model-interface';
import { BodegaApiService } from './../../../../../as/tablas/otros/bodega/service/bodega-api.service';
import {
	IResponseConsecutivoCi,
	IResponseConsInvAjCon
} from './../../../../administracion/consecutivos/model/IResponseConsecutivoCi';
import { ConsecutivoApiService } from './../../../../administracion/consecutivos/service/consecutivo-api.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
	selector: 'app-add-paqueteci-page',
	templateUrl: './add-paqueteci-page.component.html',
	styleUrls: ['./add-paqueteci-page.component.scss']
})
export class AddPaqueteciPageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,
		private _consecutivoApiService: ConsecutivoApiService,
		private _bodegaService: BodegaApiService,
		private _ajusteSubtipoApiService: AjusteSubtipoApiService,
		private _ajusteSubSubTipoApiService: AjusteSubSubTipoApiService,
		private _existenciaBodegaApiService: ExistenciaBodegaApiService,
		private _existenciaLoteApiService: ExistenciaLoteApiService,
		private _documentoInvDetApiService: DocumentoInvDetApiService,
		private _DocumentoInvEncaApiService: DocumentoInvEncaApiService,
		private _snotifyService: SnotifyService,
		private _currencyPipe: CurrencyPipe,
		// eslint-disable-next-line ngrx/no-typed-global-store
		private store: Store<AppState>,
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddPaqueteciPageComponent>,
		private _matDialog: MatDialog
	) {
		this._loadFormulario();
	}

	loading$: Observable<boolean> = new Observable();
	bodega$: Observable<any> = new Observable();
	localizacion$: Observable<any> = new Observable();
	existenciaBodega$: Observable<any> = new Observable();
	lote$: Observable<any> = new Observable();
	globalesCI$: Observable<any> = new Observable();
	datosBodega: IResponseBodega[] = [];
	globalesCI: Iglobales_CI[] = [];
	ngOnInit(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

		setTimeout(() => {
			this.store.dispatch(loadGlobalesCI());
			this.store.dispatch(loadArticuloAccion());
			this.store.dispatch(loadBodegaAccion());
			this.store.dispatch(loadLocalizacionAccion());
			this.store.dispatch(loadExistenciaBodega());
			this.store.dispatch(loadLoteAccion());
			this._loadConsecutivo(1, 10000);
			//Leemos los parametros del modulo
			this.globalesCI$ = this.store.select(selectListGlobalesCI);
			this.globalesCI$.subscribe((res) => {
				const { result } = res;
				this.globalesCI = result;
			});
			this.bodega$ = this.store.select(selectListBodega);
			this.bodega$.subscribe((res) => {
				const { result } = res;
				this.datosBodega = result;
			});
		});
	}

	formPaquete!: FormGroup;
	actionBtn = 'Guardar';
	selected = '';
	consecutivos: IResponseConsecutivoCi[] = [];
	consecutivoselecionado: IResponseConsecutivoCi[] = [];
	ajuste: IResponseConsInvAjCon[] = [];
	ajusteSubtipo: IResponseAjusteSubTipo[] = [];
	ajusteSubSubTipo: IResponseAjusteSubSubTipo[] = [];
	localizaciones: IResponseLocaizacionBodega[] = [];
	localizacionesNew: IResponseLocaizacionBodega[] = [];

	locDestino: IResponseLocaizacionBodega[] = [];
	existenciaBodega: IResponseConsultarArticuloBodega[] = [];
	existenciaBodegaNew: IResponseConsultarArticuloBodega[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ArrayDetalle: ICrearDocumnetoInvDet[] = [];
	idBodega!: number;
	documentoInv!: string;
	codAjusteConfig!: string;
	existenciaLote: IResponseExistenciaLote[] = [];
	existenciaLoteNew: IResponseExistenciaLote[] = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	seleccion: any;
	// eslint-disable-next-line @typescript-eslint/ban-types
	ajusteSelect: Number | undefined;
	linea!: number;
	idDocumentoEnca!: number;

	private _loadFormulario(): void {
		// eslint-disable-next-line no-useless-escape
		console.log('globlaesCI', this.globalesCI);
		const regexPattern = '^-?[0-9]\\d*(\\.\\d{1,3})?$';
		this.formPaquete = this._formBuilder.group({
			codConsecutivo: ['', Validators.required],
			descripcion: [''],
			fecha: [null, Validators.required],
			referencia: [null, Validators.required],
			ajuste: [null],
			fase: [null],
			ordenCambio: [null],
			centroCosto: [null],
			cuentaContable: [null],
			bodegaDestino: ['', Validators.required],
			locDestino: ['', Validators.required],
			bodega: [null],
			localizacion: [null],
			articulo: ['', Validators.required],
			cantidad: [0.0, [Validators.required, Validators.pattern(regexPattern)]],
			cantidadDetalle: [0.0, [Validators.required, Validators.pattern(regexPattern)]],
			subtipo: ['', Validators.required],
			subsubtipo: ['', Validators.required],
			lote: ['', Validators.required],
			costofiscallocal: [0, Validators.required],
			costofiscaldolar: [0, Validators.required],
			precioUnitarioLocal: [0, Validators.required],
			precioUnitarioDolar: [0, Validators.required]
		});
	}
	private _loadConsecutivo(page: number, rows: number): void {
		this._consecutivoApiService.getConsecutivoCI(page, rows).subscribe({
			next: (response) => {
				this.consecutivos = response.result;
			}
		});
	}

	selectTipo(id: number): void {
		/* consultamos ajusteSubtipo */
		this._ajusteSubtipoApiService.getAjusteSubTipo().subscribe({
			next: (response) => {
				const ajusteSubtipoNew = response.result;
				const _ajusteSubtipo = ajusteSubtipoNew.filter((p) => p.ajusteConfigId === id);
				this.ajusteSubtipo = _ajusteSubtipo;
			}
		});
		/* Consultamos ajusteSubSubTipo */
		this._ajusteSubSubTipoApiService.getAjusteSubSubTipo().subscribe({
			next: (response) => {
				const ajusteSubSubTipoNew = response.result;
				const _ajusteSubSubTipo = ajusteSubSubTipoNew.filter((p) => p.ajusteConfigId === id);
				this.ajusteSubSubTipo = _ajusteSubSubTipo;
			}
		});
	}
	selectConsecutivo(id: number): void {
		//Buscamos en consecutivo segun selecionado

		const datosNew = this.consecutivos.filter((f) => f.id == id);

		this.consecutivoselecionado = datosNew;
		//Buscamos los  registron en ConsInvAjConfig y Consecutivos Usuarios

		this._consecutivoApiService.getConsInvAjuste().subscribe({
			next: (response) => {
				const consAjusteNew = response.result;
				const _ajuste = consAjusteNew.filter((p) => p.consecutivoInvId === id);
				this.ajuste = _ajuste;
			}
		});
	}
	selectBodegaDestino(id: number): void {
		/* buscamos las localizaciones a esa bodega */
		this.idBodega = id;
		this.localizacion$ = this.store.select(selectListLocalizacion);
		this.localizacion$.subscribe((res) => {
			const localizacionesNew = res.result;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			const _localizaciones = localizacionesNew.filter((p: { bodegaId: number }) => p.bodegaId == id);
			this.localizaciones = _localizaciones;
		});

		/* buscar los articulos que estan en existencia bodega */

		this.existenciaBodega$ = this.store.select(selectListExistenciaBodega);
		this.existenciaBodega$.subscribe((res) => {
			const existenciaBodegaNew = res.result;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			const _existencisBodega = existenciaBodegaNew.filter((b: { bodegaId: number }) => b.bodegaId == id);
			this.existenciaBodega = _existencisBodega;
		});
	}

	//Bodega para traspaso
	selectBodega(id: number): void {
		/* buscamos las localizaciones a esa bodega */
		this.idBodega = id;
		this._bodegaService.getLocalizacionesAll().subscribe({
			next: (response) => {
				const localizacionesNew = response.result;
				const _localizaciones = localizacionesNew.filter((p) => p.bodegaId == id);
				this.localizaciones = _localizaciones;
			}
		});
		/* buscar los articulos que estan en existencia bodega */
		this._existenciaBodegaApiService.getall(1, 10000).subscribe({
			next: (response) => {
				const existenciabodegaNew = response.result;
				const _existencisBodega = existenciabodegaNew.filter((b) => b.bodegaId == id);
				this.existenciaBodega = _existencisBodega;
			}
		});
	}
	/* consultamos lote relacioando con articulo,bodega  y localizacion */
	selectArticulo(id: number): void {
		this.lote$ = this.store.select(selectListLote);
		this.lote$.subscribe((res) => {
			const existenciaLoteNew = res.result;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			const _existenciaLoteNew = existenciaLoteNew.filter(
				(f: { articulo: { id: number }; bodega: { id: number }; localizacion: { id: number } }) =>
					f.articulo.id == id &&
					f.bodega.id == this.idBodega &&
					f.localizacion.id == (this.locDestinoField.value as number)
			);

			this.existenciaLote = _existenciaLoteNew;
		});
	}
	guardar(): void {
		//this.addArrayDetalle();
		this.adicionar();
	}
	//Guardamos en una array detalle de transaccion
	addArrayDetalle(): void {
		for (let i = 0; i < this.consecutivoselecionado.length; i++) {
			const element = this.consecutivoselecionado[i];
			this.documentoInv = element.siguienteConsec;
		}
		for (let index = 0; index < this.ajuste.length; index++) {
			const element = this.ajuste[index];
			this.codAjusteConfig = element.ajusteConfig.ajusteBase;
		}

		if (this.ajusteSelect != 6) {
			const c: any = null; // Ok
			this.ArrayDetalle.push({
				documentoInvEncId: 1,
				lineadocinv: 0,
				tipo: this.codAjusteConfig,
				subtipo: this.subTipoField.value as string,
				subsubtipo: this.subsubTipoField.value as string,
				cantidad: this.cantidadField.value as number,
				costototaldolar: this.costofiscalDolarField.value as number,
				costototallocal: this.costofiscallocalField.value as number,
				preciototaldolar: this.precioUnitarioDolarField.value as number,
				preciototallocal: this.precioUnitarioLocalField.value as number,
				consecutivoId: this.codConsecutivoField.value as number,
				ajusteconfigId: this.ajusteField.value as number,
				articuloid: this.articuloField.value as number,
				bodegadestinoid: c,
				locdestinoid: c,
				bodegaid: this.bodegaDestinoField.value as number,
				localizacionid: this.locDestinoField.value as number,
				centrocuentaid: c,
				loteId: this.loteField.value as number,
				paqueteinventarioid: this.editData,
				tipoPagoId: 1
			});
		}
		console.log(this.ArrayDetalle);
	}
	//Guardamos
	adicionar(): void {
		/* validamos que los campos esten llenos segun requerido    */

		for (let i = 0; i < this.consecutivoselecionado.length; i++) {
			const element = this.consecutivoselecionado[i];
			this.documentoInv = element.siguienteConsec;
		}

		if (this.formPaquete.invalid) {
			return;
		}
		/* Enviamos encabezado a la tabla documentoInvEnca */
		const sendDocumentoInvEnca: ICrearDocumnetoInvEnca = {
			documentoInv: this.documentoInv,
			referencia: this.referenciaField.value as string,
			fechaDocumento: this.fechaField.value as string,
			consecutivoId: this.codConsecutivoField.value as number,
			paqueteInventarioId: this.editData,
			usuario: 'crv@gmail.com',
			mensajeSistema: ''
		};
		this._save(sendDocumentoInvEnca);
	}

	_save(documentoInvEnca: ICrearDocumnetoInvEnca): void {
		if (this.idDocumentoEnca == null) {
			this.linea = 0;
			this.linea += 1;
			console.log('Primera vez para encabezado y detalle', this.linea);
			this._DocumentoInvEncaApiService.create(documentoInvEnca).subscribe({
				next: (response) => {
					if (response && response.success) {
						this.idDocumentoEnca = response.result;
						this._adicionarDetalle();
						this._snotifyService.info('El registro se guardo sin problema');
						//	this._dialogRef.close('save');
					} else {
						this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					}
				},
				error: (e) => {
					console.log(e);
				}
			});
		} else {
			this.linea = this.linea + 1;
			this._adicionarDetalle();
		}
	}

	lote(): void {
		this._matDialog.open(AddLotePageComponent, {
			width: '30%',
			autoFocus: true,
			maxHeight: '90vh'
		});
	}
	_adicionarDetalle(): void {
		for (let i = 0; i < this.consecutivoselecionado.length; i++) {
			const element = this.consecutivoselecionado[i];
			this.documentoInv = element.siguienteConsec;
		}
		for (let index = 0; index < this.ajuste.length; index++) {
			const element = this.ajuste[index];
			this.codAjusteConfig = element.ajusteConfig.ajusteBase;
		}

		if (this.ajusteSelect != 6) {
			const c: any = null; // Ok
			console.log(this.linea);
			const data: ICrearDocumnetoInvDet = {
				documentoInvEncId: this.idDocumentoEnca,
				lineadocinv: this.linea,
				tipo: this.codAjusteConfig,
				subtipo: this.subTipoField.value as string,
				subsubtipo: this.subsubTipoField.value as string,
				cantidad: this.cantidadField.value as number,
				costototaldolar: this.costofiscalDolarField.value as number,
				costototallocal: this.costofiscallocalField.value as number,
				preciototaldolar: this.precioUnitarioDolarField.value as number,
				preciototallocal: this.precioUnitarioLocalField.value as number,
				consecutivoId: this.codConsecutivoField.value as number,
				ajusteconfigId: this.ajusteField.value as number,
				articuloid: this.articuloField.value as number,
				bodegadestinoid: c,
				locdestinoid: c,
				bodegaid: this.bodegaDestinoField.value as number,
				localizacionid: this.locDestinoField.value as number,
				centrocuentaid: c,
				loteId: this.loteField.value as number,
				paqueteinventarioid: this.editData,
				tipoPagoId: 1
			};
			this._savedetalle(data);
		}
	}

	_savedetalle(datos: ICrearDocumnetoInvDet): void {
		console.log('Guardar detalle', datos);
		this._documentoInvDetApiService.create(datos).subscribe({
			next: (response) => {
				if (response && response.success) {
					//this.formPaquete.reset();
					this._snotifyService.info('El registro se guardo sin problema');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (e) => {
				console.log(e);
			}
		});
	}
	get bodegaField(): AbstractControl {
		return this.formPaquete.get('bodega')!;
	}
	get localizacionField(): AbstractControl {
		return this.formPaquete.get('localizacion')!;
	}

	get codConsecutivoField(): AbstractControl {
		return this.formPaquete.get('codConsecutivo')!;
	}

	get descripcionField(): AbstractControl {
		return this.formPaquete.get('descripcion')!;
	}

	get fechaField(): AbstractControl {
		return this.formPaquete.get('fecha')!;
	}

	get referenciaField(): AbstractControl {
		return this.formPaquete.get('referencia')!;
	}

	get ajusteField(): AbstractControl {
		return this.formPaquete.get('ajuste')!;
	}
	get faseField(): AbstractControl {
		return this.formPaquete.get('fase')!;
	}
	get ordenCambioField(): AbstractControl {
		return this.formPaquete.get('ordenCambio')!;
	}

	get centroCostoField(): AbstractControl {
		return this.formPaquete.get('centroCosto')!;
	}
	get cuentaContableField(): AbstractControl {
		return this.formPaquete.get('cuentaContable')!;
	}

	get bodegaDestinoField(): AbstractControl {
		return this.formPaquete.get('bodegaDestino')!;
	}

	get locDestinoField(): AbstractControl {
		return this.formPaquete.get('locDestino')!;
	}
	get articuloField(): AbstractControl {
		return this.formPaquete.get('articulo')!;
	}
	get cantidadField(): AbstractControl {
		return this.formPaquete.get('cantidad')!;
	}

	get cantidadDetalleField(): AbstractControl {
		return this.formPaquete.get('cantidadDEetalle')!;
	}
	get subTipoField(): AbstractControl {
		return this.formPaquete.get('subtipo')!;
	}
	get subsubTipoField(): AbstractControl {
		return this.formPaquete.get('subsubtipo')!;
	}

	get loteField(): AbstractControl {
		return this.formPaquete.get('lote')!;
	}

	get costofiscallocalField(): AbstractControl {
		return this.formPaquete.get('costofiscallocal')!;
	}

	get costofiscalDolarField(): AbstractControl {
		return this.formPaquete.get('costofiscaldolar')!;
	}

	get precioUnitarioLocalField(): AbstractControl {
		return this.formPaquete.get('precioUnitarioLocal')!;
	}
	get precioUnitarioDolarField(): AbstractControl {
		return this.formPaquete.get('precioUnitarioDolar')!;
	}
}
