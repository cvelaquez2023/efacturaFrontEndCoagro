/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SujetoexcluidoProveedorService } from './../../services/sujetoexcluido-proveedor.service';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Inject, OnInit } from '@angular/core';
import { validateBasis } from '@angular/flex-layout';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VendedorApiService } from '@app/modules/as/tablas/funcionarios/vendedores/services/vendedor-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { IResponseDTE14 } from '../../model/sujetoExcluido_DTE_interface';

@Component({
	selector: 'app-add-sujeto-excluido',
	templateUrl: './add-sujeto-excluido.component.html',
	styleUrls: ['./add-sujeto-excluido.component.scss']
})
export class AddSujetoExcluidoComponent {
	vendedorForm!: FormGroup;
	_dui: string = '';
	_renta: number = 0.0;
	_monto: number = 0.0;
	_total: number = 0.0;
	activo = true;
	_fecha = new Date();
	_dte: string = '';
	guardar = false;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	proveedor: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	valueChange: any;
	constructor(
		private _formBuilder: FormBuilder,
		private _vendedorApiService: VendedorApiService,
		private _sujetoExcluidoApiService: SujetoexcluidoProveedorService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddSujetoExcluidoComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.vendedorForm = this._formBuilder.group({
			DUI: ['', Validators.required],
			nombre: [''],
			correo: [''],
			departamento: [''],
			municipio: [''],
			direccion: [''],
			telefono: [''],
			aplicacion: ['', Validators.required],
			monto: [0.0, Validators.required],
			renta: [0.0],
			total: [0.0],
			aplica: [true, Validators.required],
			fecha: ['', Validators.required]
		});
	}

	clickSave(): void {
		if (this.vendedorForm.invalid) {
			this._snotifyService.error('Lo campos son Obligatorios', { position: SnotifyPosition.rightTop });
			return;
		}
		if (this.totalField.value === '$0.00' || this.totalField.value === '0.00') {
			this._snotifyService.error('El total tiene que ser Mayor a Cero', { position: SnotifyPosition.rightTop });
			return;
		}

		this._sujetoExcluidoApiService.getConsecutivo('DTE14').subscribe({
			next: (response) => {
				if (response.success === true) {
					this._dte = response.result[0].ULTIMO_VALOR;
					let tipo = '';
					let doc = this.duiField.value;
					if (doc.length <= 10) {
						tipo = '13';
					} else {
						tipo = '36';
					}
					const renta = parseFloat(this.rentaField.value.replace('$', ''));
					const total = parseFloat(this.totalField.value);
					const monto = renta + total;
					const data: IResponseDTE14 = {
						tipoDocumento: '13',
						numDocumento: this.duiField.value,
						nombre: this.nombreField.value,
						direccion: {
							departamento: this.departamentoField.value,
							municipio: this.municipioField.value,
							complemento: this.direcionField.value
						},
						telefono: this.telefonoField.value,
						correo: this.correoField.value,
						aplicacion: {
							descripcion: this.aplicacionField.value,
							monto: monto,
							renta: renta,
							total: parseFloat(this.totalField.value),
							fecha: this.fechaField.value,
							dte: this._dte
						},
						hacienda: 'N',
						origen: 'CP'
					};

					this.enviarData(data);
				}
			}
		});

		//enviamos a api
	}

	private enviarData(data: IResponseDTE14): void {
		this._sujetoExcluidoApiService.postEnvioDTE(data).subscribe({
			next: (response) => {
				if (response.success === true) {
					this._snotifyService.info('El registro se guardo sin problema', {
						position: SnotifyPosition.rightTop
					});
					this.guardar = true;
					this.actualizarCorrelativo();

					this._dialogRef.close('save');
				} else {
					this._snotifyService.error('Existio un problemas', {
						position: SnotifyPosition.rightTop
					});
				}
			}
		});
	}
	//actualziamos correlativo
	private actualizarCorrelativo(): void {
		this._sujetoExcluidoApiService.postConsecutivo('DTE14').subscribe({
			next: (response) => {
				const guar = 'se guarda sin problema';
			}
		});
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
	onChangeDui($event: any) {
		this._vendedorApiService.getproveedor(this._dui).subscribe({
			next: (respose) => {
				if (respose.success == true) {
					this.proveedor = respose.result[0];
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const dire = this.proveedor.DIRECCION;
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const dir = dire.replace('DETALLE:', '');
					this.vendedorForm.controls['nombre'].setValue(this.proveedor.NOMBRE);
					this.vendedorForm.controls['direccion'].setValue(dir);
					this.vendedorForm.controls['departamento'].setValue(this.proveedor.DIVISION_GEOGRAFICA1);
					this.vendedorForm.controls['municipio'].setValue(this.proveedor.DIVISION_GEOGRAFICA2);
					this.vendedorForm.controls['telefono'].setValue(this.proveedor.TELEFONO1);
					this.vendedorForm.controls['correo'].setValue(this.proveedor.E_MAIL);
				} else {
					this._snotifyService.error('Proveedor No Existe', { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	validateFormat(event: any) {
		let key;
		if (event.type === 'paste') {
			key = event.clipboardData.getData('text/plain');
		} else {
			key = event.keyCode;
			key = String.fromCharCode(key);
		}
		const regex = /[0-9]|\./;
		if (!regex.test(key)) {
			event.returnValue = false;
			if (event.preventDefault) {
				event.preventDefault();
			}
		}
	}

	updateCurrencyField(value: string): void {
		const onlyNumbers = value.replace(/[^\d.-]/g, '');
		if (this.activo == true) {
			this._renta = parseFloat(onlyNumbers) * 0.1;
		}
		this.vendedorForm.controls['renta'].setValue(this._renta.toFixed(2));
		const total = parseFloat(onlyNumbers) - this._renta;
		this.vendedorForm.controls['total'].setValue(total.toFixed(2));
	}
	toggle(event: MatCheckboxChange) {
		this.activo = event.source.checked;
		if (this.activo == true) {
			this._renta = this.montoField.value * 0.1;
			this.vendedorForm.controls['renta'].setValue(this._renta.toFixed(2));
			this._total = this.montoField.value - this._renta;
			this.vendedorForm.controls['total'].setValue(this._total);
		} else {
			this._renta = 0.0;
			this.vendedorForm.controls['renta'].setValue(this._renta.toFixed(2));
			this._total = this.montoField.value;

			this.vendedorForm.controls['total'].setValue(this._total);
		}
	}

	get duiField(): AbstractControl {
		return this.vendedorForm.get('DUI')!;
	}
	get nombreField(): AbstractControl {
		return this.vendedorForm.get('nombre')!;
	}
	get direcionField(): AbstractControl {
		return this.vendedorForm.get('direccion')!;
	}
	get departamentoField(): AbstractControl {
		return this.vendedorForm.get('departamento')!;
	}
	get municipioField(): AbstractControl {
		return this.vendedorForm.get('municipio')!;
	}
	get telefonoField(): AbstractControl {
		return this.vendedorForm.get('telefono')!;
	}
	get correoField(): AbstractControl {
		return this.vendedorForm.get('correo')!;
	}
	get aplicacionField(): AbstractControl {
		return this.vendedorForm.get('aplicacion')!;
	}
	get montoField(): AbstractControl {
		return this.vendedorForm.get('monto')!;
	}
	get rentaField(): AbstractControl {
		return this.vendedorForm.get('renta')!;
	}
	get aplicaField(): AbstractControl {
		return this.vendedorForm.get('aplica')!;
	}
	get fechaField(): AbstractControl {
		return this.vendedorForm.get('fecha')!;
	}
	get totalField(): AbstractControl {
		return this.vendedorForm.get('total')!;
	}
}
