import { PaisApiService } from './../../../../tablas/areas/pais/service/pais-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SnotifyService } from 'ng-snotify';
import { ParametrosASApiService } from '../../service/parametros-as-api.service';
import { TipoCambioApiService } from '@app/modules/as/tablas/tipos/tipo-de-cambio/service/tipo-cambio-api.service';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'app-parametrosModulosAS-page',
	templateUrl: './parametrosModulosAS-page.component.html',
	styleUrls: ['./parametrosModulosAS-page.component.scss']
})
export class ParametrosModulosASPageComponent implements OnInit {
	globalesASForm!: FormGroup;
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	disableButtonSave = false;
	/**
	 *
	 */
	constructor(
		private _formBuilder: FormBuilder,
		private _snotifyService: SnotifyService,
		private _parametrosASApoService: ParametrosASApiService,
		private _paisAppService: PaisApiService,
		private _tipoCambioApi: TipoCambioApiService
	) {
		this._loadFormGroup();
	}
	ngOnInit(): void {
		console.log('cargamos pasis y tipo de cambio');
	}
	private _loadFormGroup(): void {
		this.globalesASForm = this._formBuilder.group({
			costoDecimal: ['', Validators.required],
			Pais: ['', Validators.required],
			NombrePais: ['', Validators.required],
			TipoCambio: ['', Validators.required],
			NombreTipoCambio: ['', Validators.required],
			PatronCentroCosto: ['', Validators.required],
			ImPuesto1: ['', Validators.required],
			ImPuesto2: ['', Validators.required],
			//Tabs Fechas
			FechaInicialConAv: ['', Validators.required],
			FechaFinalConAv: ['', Validators.required],
			FechaInicialPeriodoTrabajo: ['', Validators.required],
			FechaFinalPeriodoTrabajo: ['', Validators.required]
		});
	}
}
