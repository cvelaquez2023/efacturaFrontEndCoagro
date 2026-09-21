import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { RazonVisitaApiService } from '../../service/razon-visita-api.service';
import { ICreateRazonVisitaModel, IResponseRazonVisita } from '../../model/razon-visita-api-model-interface';

@Component({
	selector: 'app-add-razon-visita',
	templateUrl: './add-razon-visita.component.html',
	styleUrls: ['./add-razon-visita.component.scss']
})
export class AddRazonVisitaComponent {
	razonVisitaForm!: FormGroup;
	actionBtn = 'Guardar';

	constructor(
		private _formBuilder: FormBuilder,
		private _razonVisitaApiService: RazonVisitaApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: IResponseRazonVisita,
		private _dialogRef: MatDialogRef<AddRazonVisitaComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.razonVisitaForm = this._formBuilder.group({
			efectVisita: ['', [Validators.required, Validators.maxLength(2)]],
			descripcion: ['', [Validators.required, Validators.maxLength(20)]]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.razonVisitaForm.controls['efectVisita'].setValue(this.ediData.EFECT_VISITA);
			this.razonVisitaForm.controls['efectVisita'].disable();
			this.razonVisitaForm.controls['descripcion'].setValue(this.ediData.DESCRIPCION);
		}
	}

	clickSave(): void {
		if (this.razonVisitaForm.invalid) {
			return;
		}
		const data: ICreateRazonVisitaModel = {
			efectVisita: this.efectVisitaField.value as string,
			descripcion: this.descripcionField.value as string
		};
		if (!this.ediData) {
			this._save(data);
		} else {
			this._edit(data);
		}
	}

	private _save(razonVisita: ICreateRazonVisitaModel): void {
		this._razonVisitaApiService.createRazonVisita(razonVisita).subscribe({
			next: (response) => {
				if (response.success) {
					this.razonVisitaForm.reset();
					this._snotifyService.info('El registro se guardó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	private _edit(razonVisita: ICreateRazonVisitaModel): void {
		this._razonVisitaApiService.updateRazonVisita(this.ediData.EFECT_VISITA, razonVisita).subscribe({
			next: (response) => {
				if (response.success) {
					this.razonVisitaForm.reset();
					this._snotifyService.info('El registro se actualizó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get efectVisitaField(): AbstractControl {
		return this.razonVisitaForm.get('efectVisita')!;
	}
	get descripcionField(): AbstractControl {
		return this.razonVisitaForm.get('descripcion')!;
	}
}
