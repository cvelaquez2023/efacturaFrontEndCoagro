/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CentrocostoApiService } from '../../service/centrocosto-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IRequestCentroCosto } from '../../service/centrocosto-api-model-interface';

@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['./add.component.scss']
})
export class AddComponent {
	centrocostoForm!: FormGroup;
	disableSelect = new FormControl(false);
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	activo = true;
	centroCosto: any;
	constructor(
		private _formBuilder: FormBuilder,
		private _centroCostoApiService: CentrocostoApiService,
		private _snotifyService: SnotifyService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddComponent>
	) {
		this._loadFormGroup();
		this.centroCosto = '';
	}

	onBlurMethid(): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		alert(this.validarPlanDeCuenta(this.centroCosto));
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	validarPlanDeCuenta(planDeCuenta: string) {
		const patron = /^\d{1}-\d{2}-\d{3}$/;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const centroCosto = '9-99-99-999';

		// eslint-disable-next-line prefer-const
		let arrCentrocosto: string[] = centroCosto.split('-');
		let patron2 = '';
		for (let index = 0; index < arrCentrocosto.length; index++) {
			const element = arrCentrocosto[index];
			const cantidad = element.length;
			// eslint-disable-next-line no-useless-escape

			patron2 = patron2 + `\\d{${cantidad.toString()}}-`;
		}
		let quitarUtilmo = patron2.substring(0, patron2.length - 1);
		let Inicio = '/^';
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Inicio = Inicio.concat(quitarUtilmo);
		let Fin = Inicio + '$/';

		console.log(Fin);

		//resultadoConsole = Patron2 d{1}d{2}d{2}d{3}

		// eslint-disable-next-line prefer-const
		let arr = planDeCuenta.split('-');
		if (arrCentrocosto.length == arr.length) {
			console.log('Son igulaes');
		} else {
			console.log('no son iguales');
		}
		console.log(arr);
		return patron.test(planDeCuenta);
	}

	private _loadFormGroup(): void {
		this.centrocostoForm = this._formBuilder.group({
			codCentroCosto: [
				'',
				[Validators.required, Validators.maxLength(24), Validators.pattern(/^[0-9]\d*(\.[0-9]\d*)*$/)]
			],
			descripcion: ['', [Validators.required, Validators.maxLength(150)]],
			aceptaDatos: ['', Validators.required],
			tipo: ['', Validators.required]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.centrocostoForm.controls['codCentroCosto'].setValue(this.ediData.codCentroCosto);
			this.centrocostoForm.controls['codCentroCosto'].disable();
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.centrocostoForm.controls['descripcion'].setValue(this.ediData.descripcion);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.centrocostoForm.controls['aceptaDatos'].setValue(this.ediData.aceptaDatos);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			this.centrocostoForm.controls['tipo'].setValue(this.ediData.tipo);
		}
	}
	clickSave(): void {
		if (this.centrocostoForm.invalid) {
			return;
		}
		if (!this.ediData) {
			const sendCentroCosto: IRequestCentroCosto = {
				codCentroCosto: this.codCentroCostoField.value as string,
				descripcion: this.descripcionField.value as string,
				aceptadatos: this.aceptaDatosField.value as boolean,
				tipo: this.tipoField.value as string
			};
			this._save(sendCentroCosto);
		} else {
			const sendCentroCosto: IRequestCentroCosto = {
				codCentroCosto: this.codCentroCostoField.value as string,
				descripcion: this.descripcionField.value as string,
				aceptadatos: this.aceptaDatosField.value as boolean,
				tipo: this.tipoField.value as string
			};
			this._edit(sendCentroCosto);
		}
	}
	private _save(centrocosto: IRequestCentroCosto) {
		this._centroCostoApiService.createCentroCosto(centrocosto).subscribe({
			next: (response) => {
				if (response.success) {
					this.centrocostoForm.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	private _edit(centrocosto: IRequestCentroCosto) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this._centroCostoApiService.updateCentroCosto(this.ediData.id as number, centrocosto).subscribe({
			next: (response) => {
				if (response.success) {
					this.centrocostoForm.reset();
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (er) => {
				console.log('error', er);
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	}

	get codCentroCostoField(): AbstractControl {
		return this.centrocostoForm.get('codCentroCosto')!;
	}
	get descripcionField(): AbstractControl {
		return this.centrocostoForm.get('descripcion')!;
	}
	get aceptaDatosField(): AbstractControl {
		return this.centrocostoForm.get('aceptaDatos')!;
	}

	get tipoField(): AbstractControl {
		return this.centrocostoForm.get('tipo')!;
	}
}
