import { ICreateGlobalesAS } from './../../../../../as/administracion/services/parametros-as-api-model-interface';
import { ICreateGlobalesCG } from './../../model/parametros-cg-api-model-interface';
import { Component, OnInit } from '@angular/core';

import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { ParametrosCgApiService } from '../../service/parametros-cg-api.service';

@Component({
	selector: 'app-param-modulo-page',
	templateUrl: './param-modulo-page.component.html',
	styleUrls: ['./param-modulo-page.component.scss']
})
export class ParamModuloPageComponent implements OnInit {
	globalesCG: ICreateGlobalesCG[] = [];
	globalesCGForm!: FormGroup;
	actionBtn = 'Guardar';
	constructor(
		private _formbuilder: FormBuilder,
		private _snotifyService: SnotifyService,
		private _parametrosCGApiService: ParametrosCgApiService
	) {
		this._loadFormGroup();
	}
	ngOnInit(): void {
		this._loadGlobalesCG();
	}
	private _loadFormGroup(): void {
		this.globalesCGForm = this._formbuilder.group({
			cuenta: ['', Validators.required],
			precisionNumerica: ['0', Validators.required],
			truncar: [true],
			redondear: [false],
			centroCostoCuenta: [true],
			cuentaCentroCosto: [false],

			//tab asiento
			nombre: ['', Validators.required],
			paquete: [true],
			paqueteGlobal: [false],
			NumeroGlobal: ['']
		});
	}
	private _loadGlobalesCG(): void {
		this._parametrosCGApiService.getGlobalesCG().subscribe({
			next: (response) => {
				if (response.success) {
					this.globalesCG = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	clickSave(): void {
		if (this.globalesCGForm.invalid) {
			return;
		}
		if (this.globalesCG.length === 0) {
			//Guardamos
			/*
			const sendGlobalesCG: ICreateGlobalesCG = {
				TipAsntCierreAn: null as string,
				Patron: this.cuentaField.value as string
			};
			this._save(sendGlobalesCG);
			*/
		} else {
			//editamos
		}
	}
	private _save(_globalesCG: ICreateGlobalesCG) {
		this._parametrosCGApiService.createGlobalesCG(_globalesCG).subscribe({
			next: (response) => {
				if (response.success) {
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get cuentaField(): AbstractControl {
		return this.globalesCGForm.get('cuenta')!;
	}
	get precisionNumericaField(): AbstractControl {
		return this.globalesCGForm.get('precisionNumerica')!;
	}
	get truncarField(): AbstractControl {
		return this.globalesCGForm.get('truncar')!;
	}
	get redondearField(): AbstractControl {
		return this.globalesCGForm.get('redondear')!;
	}
	get centroCostoCuentaField(): AbstractControl {
		return this.globalesCGForm.get('centroCostoCuenta')!;
	}
	get cuentaCentroCostoField(): AbstractControl {
		return this.globalesCGForm.get('cuentaCentroCosto')!;
	}
	get nombreField(): AbstractControl {
		return this.globalesCGForm.get('nombre')!;
	}
	get paqueteField(): AbstractControl {
		return this.globalesCGForm.get('paquete')!;
	}
	get paqueteGlobalField(): AbstractControl {
		return this.globalesCGForm.get('paqueteGlobal')!;
	}
	get NumeroGlobalField(): AbstractControl {
		return this.globalesCGForm.get('NumeroGlobal')!;
	}
}
