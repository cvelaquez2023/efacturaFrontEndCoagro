import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { NivelPrecioApiService } from './../../services/nivel-precio-api.service';
import { IResponseNivelPrecio, IRequestCreateNivelPrecio } from './../../services/nivel-precio-api-model-interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
	ICondicionPagoConsulta,
	ICondicionPagoCreate
} from './../../../../tipos/condcion-pago/models/condicionPago-api-model-interface';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { selectCondicionPago } from './../../../../tipos/condcion-pago/store/condicionPago.selectors';
/* eslint-disable ngrx/no-typed-global-store */
import { Observable } from 'rxjs';
import { FormControl, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/config/app.state';

@Component({
	selector: 'app-add-nivel-precio-page',
	templateUrl: './add-nivel-precio-page.component.html',
	styleUrls: ['./add-nivel-precio-page.component.scss']
})
export class AddNivelPrecioPageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,
		private store: Store<AppState>,
		private _nivelPrecioApiService: NivelPrecioApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: IResponseNivelPrecio,
		private _dialogRef: MatDialogRef<AddNivelPrecioPageComponent>
	) {
		this._loadFormulario();
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	condicionPago$: Observable<any> = new Observable();
	condicionPago: ICondicionPagoConsulta[] = [];
	inputValue = '';
	ngOnInit(): void {
		setTimeout(() => {
			this.condicionPago$ = this.store.select(selectCondicionPago);
			this.condicionPago$.subscribe((resp) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				const { result } = resp.condicionPago;
				this.condicionPago = result;
			});
		});
	}
	disableSelect = new FormControl(false);
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	//Creamos el formulario para hacerlo reactivo
	formNivelPrecio!: FormGroup;
	private _loadFormulario(): void {
		this.formNivelPrecio = this._formBuilder.group({
			nivelPrecio: ['', [Validators.required, Validators.maxLength(10)]],
			moneda: ['', Validators.required],
			esquema: ['', Validators.required],
			condPago: null
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.formNivelPrecio.controls['nivelPrecio'].setValue(this.ediData.codNivelPrecio);
			this.formNivelPrecio.controls['nivelPrecio'].disable();
			this.formNivelPrecio.controls['moneda'].setValue(this.ediData.moneda);
			this.formNivelPrecio.controls['esquema'].setValue(this.ediData.esquemaTrabajo);
			if (this.ediData.condicionPagoId) {
				this.formNivelPrecio.controls['condPago'].setValue(this.ediData.condicionPagoId);
			}
		}
	}
	clickSave(): void {
		if (this.formNivelPrecio.invalid) {
			return;
		}
		if (!this.ediData) {
			const sendDatos: IRequestCreateNivelPrecio = {
				codNivelprecio: this.nivelPrecioField.value as string,
				moneda: this.monedaField.value as string,
				esquemaTrabajo: this.esquemaField.value as string,
				condicionPagoId: this.condPagoField.value as number,
				sugerirDescuento: true
			};
			this._save(sendDatos);
		} else {
			const sendDatos: IRequestCreateNivelPrecio = {
				codNivelprecio: this.nivelPrecioField.value as string,
				moneda: this.monedaField.value as string,
				esquemaTrabajo: this.esquemaField.value as string,
				condicionPagoId: this.condPagoField.value as number,
				sugerirDescuento: true
			};
			this._update(sendDatos);
		}
	}

	private _save(datos: IRequestCreateNivelPrecio) {
		this._nivelPrecioApiService.createNivelPrecio(datos).subscribe({
			next: (response) => {
				if (response.success) {
					this.formNivelPrecio.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	private _update(datos: IRequestCreateNivelPrecio) {
		this._nivelPrecioApiService.updateNivelprecio(this.ediData.id, datos).subscribe({
			next: (response) => {
				if (response.success) {
					this.formNivelPrecio.reset();
					this._snotifyService.info('El registro se actualizo con existo', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('erro');
			}
		});
	}
	get nivelPrecioField(): AbstractControl {
		return this.formNivelPrecio.get('nivelPrecio')!;
	}
	get monedaField(): AbstractControl {
		return this.formNivelPrecio.get('moneda')!;
	}
	get esquemaField(): AbstractControl {
		return this.formNivelPrecio.get('esquema')!;
	}
	get condPagoField(): AbstractControl {
		return this.formNivelPrecio.get('condPago')!;
	}
}
