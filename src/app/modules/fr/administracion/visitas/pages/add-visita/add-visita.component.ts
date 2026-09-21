import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { VisitaApiService } from '../../service/visita-api.service';
import { ICreateVisitaModel, IResponseVisita } from '../../model/visita-api-model-interface';
import { RazonVisitaApiService } from '../../../razones-visita/service/razon-visita-api.service';
import { IResponseRazonVisita } from '../../../razones-visita/model/razon-visita-api-model-interface';

@Component({
	selector: 'app-add-visita',
	templateUrl: './add-visita.component.html',
	styleUrls: ['./add-visita.component.scss']
})
export class AddVisitaComponent {
	visitaForm!: FormGroup;
	actionBtn = 'Guardar';
	// Estado de la visita: catálogo real "Razones de Efectividad de Visita" (manual pág. 106).
	estadosVisita: IResponseRazonVisita[] = [];
	// Tipo Visita: "clasificación de la visita, según el tipo de transacciones que se haya
	// realizado para con el cliente" (manual FRm pág. 211). La columna real es 1 carácter.
	tiposVisita = [
		{ value: 'I', label: 'Inventario' },
		{ value: 'C', label: 'Cobro' },
		{ value: 'P', label: 'Pedido' },
		{ value: 'D', label: 'Devolución' },
		{ value: 'V', label: 'Visita sin movimiento' }
	];

	constructor(
		private _formBuilder: FormBuilder,
		private _visitaApiService: VisitaApiService,
		private _razonVisitaApiService: RazonVisitaApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: IResponseVisita,
		private _dialogRef: MatDialogRef<AddVisitaComponent>
	) {
		this._loadFormGroup();
		this._loadEstadosVisita();
	}

	private _loadEstadosVisita(): void {
		this._razonVisitaApiService.getRazonVisita().subscribe({
			next: (response) => {
				if (response.success) {
					this.estadosVisita = response.result;
				}
			}
		});
	}

	private _loadFormGroup(): void {
		this.visitaForm = this._formBuilder.group({
			ruta: ['', [Validators.required, Validators.maxLength(4)]],
			cliente: ['', [Validators.required, Validators.maxLength(20)]],
			inicio: ['', [Validators.required]],
			razon: ['', [Validators.required, Validators.maxLength(2)]],
			fin: ['', [Validators.required]],
			fechaPlan: ['', [Validators.required]],
			tipo: ['', [Validators.maxLength(1)]],
			notas: ['', [Validators.maxLength(512)]],
			docPro: ['', [Validators.maxLength(1)]]
		});
		if (this.ediData) {
			this.actionBtn = 'Editar';
			this.visitaForm.patchValue({
				ruta: this.ediData.RUTA,
				cliente: this.ediData.CLIENTE,
				inicio: this._toDatetimeLocal(this.ediData.INICIO),
				razon: this.ediData.RAZON,
				fin: this._toDatetimeLocal(this.ediData.FIN),
				fechaPlan: this._toDateOnly(this.ediData.FECHA_PLAN),
				tipo: this.ediData.TIPO,
				notas: this.ediData.NOTAS,
				docPro: this.ediData.DOC_PRO
			});
			this.visitaForm.controls['ruta'].disable();
			this.visitaForm.controls['cliente'].disable();
			this.visitaForm.controls['inicio'].disable();
		}
	}

	clickSave(): void {
		if (this.visitaForm.invalid) {
			return;
		}
		const data: ICreateVisitaModel = {
			cliente: this.clienteField.value as string,
			ruta: this.rutaField.value as string,
			inicio: this._withSeconds(this.inicioField.value as string),
			razon: this.razonField.value as string,
			fin: this._withSeconds(this.finField.value as string),
			fechaPlan: this._withSeconds(this.fechaPlanField.value as string),
			tipo: this.tipoField.value as string,
			notas: this.notasField.value as string,
			docPro: this.docProField.value as string
		};
		if (!this.ediData) {
			this._save(data);
		} else {
			this._edit(data);
		}
	}

	private _save(visita: ICreateVisitaModel): void {
		this._visitaApiService.createVisita(visita).subscribe({
			next: (response) => {
				if (response.success) {
					this.visitaForm.reset();
					this._snotifyService.info('El registro se guardó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	private _edit(visita: ICreateVisitaModel): void {
		this._visitaApiService.updateVisita(this.ediData.RUTA, this.ediData.CLIENTE, this.ediData.INICIO, visita).subscribe({
			next: (response) => {
				if (response.success) {
					this.visitaForm.reset();
					this._snotifyService.info('El registro se actualizó sin problema', { position: SnotifyPosition.rightTop });
					this._dialogRef.close('update');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	private _withSeconds(value: string): string {
		if (!value) return value;
		// El input datetime-local/date omite los segundos; SQL Server no
		// convierte implícitamente un DATETIME sin precisión de segundos.
		return value.length <= 10 ? value + 'T00:00:00' : value + ':00';
	}

	private _toDatetimeLocal(value: string): string {
		if (!value) return '';
		return value.slice(0, 16);
	}

	private _toDateOnly(value: string): string {
		if (!value) return '';
		return value.slice(0, 10);
	}

	get rutaField(): AbstractControl {
		return this.visitaForm.get('ruta')!;
	}
	get clienteField(): AbstractControl {
		return this.visitaForm.get('cliente')!;
	}
	get inicioField(): AbstractControl {
		return this.visitaForm.get('inicio')!;
	}
	get razonField(): AbstractControl {
		return this.visitaForm.get('razon')!;
	}
	get finField(): AbstractControl {
		return this.visitaForm.get('fin')!;
	}
	get fechaPlanField(): AbstractControl {
		return this.visitaForm.get('fechaPlan')!;
	}
	get tipoField(): AbstractControl {
		return this.visitaForm.get('tipo')!;
	}
	get notasField(): AbstractControl {
		return this.visitaForm.get('notas')!;
	}
	get docProField(): AbstractControl {
		return this.visitaForm.get('docPro')!;
	}
}
