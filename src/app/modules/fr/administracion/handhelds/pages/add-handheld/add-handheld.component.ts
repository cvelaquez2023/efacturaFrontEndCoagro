import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { HandheldApiService } from '../../service/handheld-api.service';
import { ICreateHandheldModel, IResponseHandheld } from '../../model/handheld-fr-model-interface';

@Component({
	selector: 'app-add-handheld',
	templateUrl: './add-handheld.component.html',
	styleUrls: ['./add-handheld.component.scss']
})
export class AddHandheldComponent {
	handheldForm!: FormGroup;
	actionBtn = 'Guardar';

	constructor(
		private _formBuilder: FormBuilder,
		private _handheldApiService: HandheldApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: IResponseHandheld,
		private _dialogRef: MatDialogRef<AddHandheldComponent>
	) {
		this._loadFormGroup();
	}

	private _loadFormGroup(): void {
		this.handheldForm = this._formBuilder.group({
			handheld: ['', [Validators.required, Validators.maxLength(4)]],
			descripcion: ['', [Validators.required, Validators.maxLength(40)]],
			serie: ['', [Validators.maxLength(15)]],
			modelo: ['', [Validators.maxLength(15)]],
			estado: ['A', [Validators.required]],
			firma: ['', [Validators.maxLength(2048)]]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.handheldForm.controls['handheld'].setValue(this.ediData.HANDHELD);
			this.handheldForm.controls['handheld'].disable();
			this.handheldForm.controls['descripcion'].setValue(this.ediData.DESCRIPCION);
			this.handheldForm.controls['serie'].setValue(this.ediData.SERIE);
			this.handheldForm.controls['modelo'].setValue(this.ediData.MODELO);
			this.handheldForm.controls['estado'].setValue(this.ediData.ESTADO);
			this.handheldForm.controls['firma'].setValue(this.ediData.FIRMA);
		}
	}

	clickSave(): void {
		if (this.handheldForm.invalid) {
			return;
		}
		const data: ICreateHandheldModel = {
			handheld: this.handheldField.value as string,
			descripcion: this.descripcionField.value as string,
			serie: this.serieField.value as string,
			modelo: this.modeloField.value as string,
			estado: this.estadoField.value as string,
			firma: this.firmaField.value as string
		};
		if (!this.ediData) {
			this._save(data);
		} else {
			this._edit(data);
		}
	}

	private _save(handheld: ICreateHandheldModel): void {
		this._handheldApiService.createHandheld(handheld).subscribe({
			next: (response) => {
				if (response.success) {
					this.handheldForm.reset();
					this._snotifyService.info('El registro se guardó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	private _edit(handheld: ICreateHandheldModel): void {
		this._handheldApiService.updateHandheld(this.ediData.HANDHELD, handheld).subscribe({
			next: (response) => {
				if (response.success) {
					this.handheldForm.reset();
					this._snotifyService.info('El registro se actualizó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	get handheldField(): AbstractControl {
		return this.handheldForm.get('handheld')!;
	}
	get descripcionField(): AbstractControl {
		return this.handheldForm.get('descripcion')!;
	}
	get serieField(): AbstractControl {
		return this.handheldForm.get('serie')!;
	}
	get modeloField(): AbstractControl {
		return this.handheldForm.get('modelo')!;
	}
	get estadoField(): AbstractControl {
		return this.handheldForm.get('estado')!;
	}
	get firmaField(): AbstractControl {
		return this.handheldForm.get('firma')!;
	}
}
