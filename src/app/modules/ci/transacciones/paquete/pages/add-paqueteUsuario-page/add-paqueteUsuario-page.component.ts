import { MatDialogRef } from '@angular/material/dialog';
import { ICreatePaqueteInv } from './../../model/paqueteInv-api-model-interface';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { PaqueteciApiService } from './../../service/paqueteci-api.service';
import { Component, OnInit } from '@angular/core';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'app-add-paqueteUsuario-page',
	templateUrl: './add-paqueteUsuario-page.component.html',
	styleUrls: ['./add-paqueteUsuario-page.component.scss']
})
export class AddPaqueteUsuarioPageComponent {
	constructor(
		private _paqueteciApiService: PaqueteciApiService,
		private _snotifyService: SnotifyService,
		private _formBuilder: FormBuilder,
		private _dialogReF: MatDialogRef<AddPaqueteUsuarioPageComponent>
	) {
		this._loadFormGroup();
	}

	paqueteForm!: FormGroup;
	inputValue = '';
	private _loadFormGroup(): void {
		this.paqueteForm = this._formBuilder.group({
			codPaqueteInv: ['', [Validators.required, Validators.maxLength(4)]],
			descripcion: ['', [Validators.required, Validators.maxLength(40)]]
		});
	}
	clickSave(): void {
		if (this.paqueteForm.invalid) {
			return;
		}
		const sendPaquete: ICreatePaqueteInv = {
			codPaqueteInv: this.codPaqueteInvField.value as string,
			descripcion: this.descripcionField.value as string,
			ultimoUsuario: 'SA',
			usuarioCreador: 'SA',
			fechaUltAcceso: '1890-01-01'
		};
		this._save(sendPaquete);
	}

	private _save(paquete: ICreatePaqueteInv) {
		this._paqueteciApiService.createPaquete(paquete).subscribe({
			next: (response) => {
				if (response.success) {
					this.paqueteForm.reset();
					this._snotifyService.info('El Registro se Guardo con exito', { position: SnotifyPosition.rightTop });
					this._dialogReF.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	get codPaqueteInvField(): AbstractControl {
		return this.paqueteForm.get('codPaqueteInv')!;
	}
	get descripcionField(): AbstractControl {
		return this.paqueteForm.get('descripcion')!;
	}
}
