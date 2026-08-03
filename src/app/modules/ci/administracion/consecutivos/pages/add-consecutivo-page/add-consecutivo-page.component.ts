import { IResponseConsUsuario, ICreateConsInvAjCon } from './../../model/IResponseConsecutivoCi';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseTransConfigurable } from './../../../transacciones-configurables/model/transConfigurable-model-interface';
import { IResponseConsInvAjCon } from './../../model/IResponseConsecutivoCi';
import { TransConfigurableApiService } from './../../../transacciones-configurables/service/transConfigurable-api.service';
import { ConsecutivoApiService } from './../../service/consecutivo-api.service';
import { FormControl, FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';

@Component({
	selector: 'app-add-consecutivo-page',
	templateUrl: './add-consecutivo-page.component.html',
	styleUrls: ['./add-consecutivo-page.component.scss']
})
export class AddConsecutivoPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _consecutivoApiService: ConsecutivoApiService,
		private _transConfigurableApiService: TransConfigurableApiService,
		private _snotifyService: SnotifyService,
		private _formBuilder: FormBuilder,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: any,
		private _dialogRef: MatDialogRef<AddConsecutivoPageComponent>
	) {
		this._loadFormGroup();
	}
	consecutivoForm!: FormGroup;
	listBodega = new MatTableDataSource<IResponseConsInvAjCon>();
	listUsuario = new MatTableDataSource<IResponseConsUsuario>();
	displayedColumnsUser: string[] = ['suario', 'actions'];
	displayedColumns: string[] = ['codigo', 'nombre', 'tipobase', 'actions'];
	consInvAjute: IResponseConsInvAjCon[] = [];
	ajustes: IResponseTransConfigurable[] = [];
	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';

	ngOnInit(): void {
		setTimeout(() => {
			this._loadajustes();
			this._loadAjustesConfig();
			this._loadConsUsuario();
		}, 0);
	}
	ngAfterViewInit(): void {
		this.listBodega.paginator = this.paginator;
		this.listBodega.sort = this.sort;
	}
	disableSelect = new FormControl(false);
	private _loadFormGroup(): void {
		this.consecutivoForm = this._formBuilder.group({
			codConsecutivo: ['', [Validators.required, Validators.maxLength(10)]],
			descripcion: ['', [Validators.required, Validators.maxLength(40)]],
			mascara: ['NNN-9999'],
			siguienteValor: ['', [Validators.required, Validators.maxLength(50)]],
			consecutivoPara: ['', Validators.required],
			editable: [false],
			asociado: [false],
			ajuste: ['', Validators.required]
		});
		if (this.editData) {
			this.actionBtn = 'Editar';

			this.consecutivoForm.controls['codConsecutivo'].setValue(this.editData.codConsecutivo);
			this.consecutivoForm.controls['codConsecutivo'].disable();
			this.consecutivoForm.controls['descripcion'].setValue(this.editData.descripcion);
			this.consecutivoForm.controls['mascara'].setValue(this.editData.mascara);
			this.consecutivoForm.controls['mascara'].disable();
			this.consecutivoForm.controls['siguienteValor'].setValue(this.editData.siguienteConsec);
			this.consecutivoForm.controls['consecutivoPara'].setValue(this.editData.tipo);
			this.consecutivoForm.controls['consecutivoPara'].disable();
			this.consecutivoForm.controls['editable'].setValue(this.editData.editable);
			this.consecutivoForm.controls['asociado'].setValue(this.editData.todasTrans);
		}
	}
	private _loadajustes(): void {
		this._consecutivoApiService.getConsInvAjuste().subscribe({
			next: (response) => {
				const consAjusteNew = response.result;
				const ajuste = consAjusteNew.filter((p) => p.consecutivoInvId === this.editData.id);
				this.listBodega.data = ajuste;
			},
			error: () => {
				console.log('error');
			}
		});
	}
	private _loadAjustesConfig(): void {
		this._transConfigurableApiService.getTranConfig().subscribe({
			next: (response) => {
				this.ajustes = response.result;
			},
			error: () => {
				console.log('error');
			}
		});
	}

	private _loadConsUsuario(): void {
		this._consecutivoApiService.getConsUsuario().subscribe({
			next: (response) => {
				const newReponse = response.result;
				console.log(response.result);
				/* 	const lUsuario = newReponse.filter((p) => p.CodCosecutivo === this.editData.id);
				console.log(lUsuario);
				this.listUsuario.data = lUsuario; */
			}
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	clickDelete(id: number): void {
		this._snotifyService.confirm('Esta seguro de eliminar el registro?', {
			position: SnotifyPosition.rightTop,
			buttons: [
				{
					text: 'SI',
					bold: true,
					action: (toast) => {
						this._snotifyService.remove(toast.id);
						this._consecutivoApiService.deleteConstInvAjuste(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadajustes();
							}
						});
					}
				},
				{
					text: 'CANCELAR'
				}
			]
		});
	}
	adicionar(): void {
		if (this.ajusteField.invalid) {
			console.log('requiere datos');
			return;
		}
		const sendConsInvAjConf: ICreateConsInvAjCon = {
			consecutivoInvId: this.editData.id as number,
			ajusteConfigId: this.ajusteField.value as number
		};
		this._consecutivoApiService.createConsInvAjuste(sendConsInvAjConf).subscribe({
			next: (response) => {
				if (response.success) {
					this._snotifyService.info('El registro de adiciono con existo', { position: SnotifyPosition.rightTop });
					this._loadajustes();
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
		console.log(this.ajusteField);
	}
	get codConsecutivoField(): AbstractControl {
		return this.consecutivoForm.get('codConsecutivo')!;
	}
	get ajusteField(): AbstractControl {
		return this.consecutivoForm.get('ajuste')!;
	}
}
