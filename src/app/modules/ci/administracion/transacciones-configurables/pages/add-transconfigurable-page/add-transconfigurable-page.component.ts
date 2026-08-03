import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { TransConfigurableApiService } from './../../service/transConfigurable-api.service';
import { ICreateAjsutesConfig } from './../../../consecutivos/model/IResponseConsecutivoCi';
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IResponseConsecutivoCi, IResponseConsInvAjCon } from './../../../consecutivos/model/IResponseConsecutivoCi';
import { MatTableDataSource } from '@angular/material/table';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SubtipoInterface } from './../../model/subtipo-interface';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { ConsecutivoApiService } from '../../../consecutivos/service/consecutivo-api.service';
import { ChangeDetectionStrategy } from '@angular/compiler';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-add-transconfigurable-page',
	templateUrl: './add-transconfigurable-page.component.html',
	styleUrls: ['./add-transconfigurable-page.component.scss']
})
export class AddTransconfigurablePageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,
		private _consecutivoApiService: ConsecutivoApiService,
		private _transConfigurableApiService: TransConfigurableApiService,
		private _snotifyService: SnotifyService,
		@Inject(MAT_DIALOG_DATA) public ediData: any,
		private _dialogRef: MatDialogRef<AddTransconfigurablePageComponent>
	) {
		this._loadForm();
	}
	ngOnInit(): void {
		setTimeout(() => {
			this._loadConsecutivo();
		}, 0);
	}

	Form!: FormGroup;
	selected = '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_subtipo: SubtipoInterface[] | undefined;
	_subsubtipo: SubtipoInterface[] | undefined;
	_subtipoSelecionado: any[] = [];
	_subsubtipoSelecionado: any[] = [];
	_ajuste!: IResponseConsInvAjCon[];
	_queryConsecutivo: any[] = [];
	_consecutivos!: IResponseConsecutivoCi[];
	//Tabla de consecutivos relacionado a ese transaccion
	listConsecutivo = new MatTableDataSource<any>();
	displayedColumns: string[] = ['codigo', 'nombre', 'tipobase'];
	_idAjusteConfig: number | undefined;
	//Creacmos el array  para subtipo
	subtipo = [
		{
			ajusteBase: 'O',
			nombre: 'Compra',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' }
			],
			subsubtipo: [
				{ codigo: 'I', nombre: 'Importacion' },
				{ codigo: 'L', nombre: 'Local' }
			]
		},
		{
			ajusteBase: 'C',
			nombre: 'Consumo',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' },
				{ codigo: 'I', nombre: 'Remitidad' },
				{ codigo: 'R', nombre: 'Reservada' },
				{ codigo: 'V', nombre: 'Vencida' }
			],
			subsubtipo: [
				{ codigo: 'D', nombre: 'Desperdicio' },
				{ codigo: 'G', nombre: 'Gasto' },
				{ codigo: 'N', nombre: 'Normal' },
				{ codigo: 'R', nombre: 'Re-re-trabajo' }
			]
		},
		{
			ajusteBase: 'S',
			nombre: 'Costo',
			subtipo: [
				{ codigo: 'F', nombre: 'Fiscal' },
				{ codigo: 'P', nombre: 'Comparativo' }
			],
			subsubtipo: [
				{ codigo: 'P', nombre: 'Promedio' },
				{ codigo: 'T', nombre: 'Estándar' }
			]
		},
		{
			ajusteBase: 'F',
			nombre: 'Fisico',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' },
				{ codigo: 'I', nombre: 'Remitidad' },
				{ codigo: 'V', nombre: 'Vencida' }
			],
			subsubtipo: [{ codigo: '', nombre: '******' }]
		},
		{
			ajusteBase: 'M',
			nombre: 'Miscelaneo',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' },
				{ codigo: 'R', nombre: 'Reservada' },
				{ codigo: 'V', nombre: 'Vencida' }
			],
			subsubtipo: [{ codigo: '', nombre: '******' }]
		},
		{
			ajusteBase: 'P',
			nombre: 'Produccion',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' }
			],
			subsubtipo: [
				{ codigo: 'Q', nombre: 'Requerido' },
				{ codigo: 'S', nombre: 'Subproducto' }
			]
		},
		{
			ajusteBase: 'T',
			nombre: 'Traspaso',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' },
				{ codigo: 'R', nombre: 'Reservada' },
				{ codigo: 'V', nombre: 'Vencida' }
			],
			subsubtipo: [{ codigo: '', nombre: '******' }]
		},
		{
			ajusteBase: 'N',
			nombre: 'Vencimiento',
			subtipo: [
				{ codigo: 'I', nombre: 'Remitidad' },
				{ codigo: 'D', nombre: 'Disponible' },
				{ codigo: 'R', nombre: 'Reservada' }
			],
			subsubtipo: [
				{ codigo: 'A', nombre: 'Dañado' },
				{ codigo: 'Z', nombre: 'Rechazado' },
				{ codigo: 'V', nombre: 'Vencido' }
			]
		},
		{
			ajusteBase: 'V',
			nombre: 'Ventas',
			subtipo: [
				{ codigo: 'C', nombre: 'Cuarentena' },
				{ codigo: 'D', nombre: 'Disponible' },
				{ codigo: 'R', nombre: 'Reservada' },
				{ codigo: 'V', nombre: 'Vencida' }
			],
			subsubtipo: [
				{ codigo: 'E', nombre: 'Exportación' },
				{ codigo: 'L', nombre: 'Local' }
			]
		}
	];

	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Guardar';

	private _loadConsecutivo(): void {
		//Consultamos los consecutivos que existen
		this._consecutivoApiService.getConsecutivoCI(1, 1000).subscribe({
			next: (resp) => {
				this._consecutivos = resp.result;
			},
			error: () => {
				console.log('error');
			}
		});
	}

	private _loadajustes(id: string): void {
		this._queryConsecutivo = [];
		this._consecutivoApiService.getConsInvAjuste().subscribe({
			next: (response) => {
				const consAjusteNew = response.result;

				this._ajuste = consAjusteNew.filter((p) => p.ajusteConfig.ajusteBase === id);
				//const ajuste = consAjusteNew.filter((p) => p. === this.editData.id);
				for (let i = 0; i < this._ajuste.length; i++) {
					const element = this._ajuste[i];
					//Filtramos en cosecutivos cuales cumple con el filtro
					const datos = this._consecutivos.filter((p) => p.id == element.consecutivoInvId);

					this._queryConsecutivo.push(datos);
					//Mostar esto en el tab de consecutivos
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}

	private _loadForm(): void {
		this.Form = this._formBuilder.group({
			codAjuste: ['', Validators.required],
			descripcion: ['', Validators.required],
			ajuste: ['', Validators.required],
			activo: [false],
			funcionalidad: ['E']
		});
	}
	select(id: string): void {
		const resul = this.subtipo.find((tipo) => tipo.ajusteBase === id);
		const dataSubtipo = resul?.subtipo;
		const dataSubSubtipo = resul?.subsubtipo;
		this._subtipo = dataSubtipo;
		this._subsubtipo = dataSubSubtipo;
		this._loadajustes(id);
	}
	onSelection(id: string): void {
		console.log(id);
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	//Aqui trabajando con los subtipo
	public selChange(e: MatSelectionListChange): void {
		const selecion: any = e.options[0].value;
		const resultado: SubtipoInterface | undefined = this._subtipo?.find((t) => t.codigo == selecion);
		const _codigo = resultado?.codigo;
		this._subtipoSelecionado.push(resultado);
		const nuevo = this._subtipo?.filter((p) => p.codigo !== _codigo);
		this._subtipo = nuevo;
	}
	////Aqui tememos lo de subsubtipo
	public selChange2(e: MatSelectionListChange): void {
		const selecion2: any = e.options[0].value;
		const resultado2: SubtipoInterface | undefined = this._subsubtipo?.find((t) => t.codigo == selecion2);

		const _codigo2 = resultado2?.codigo;
		this._subsubtipoSelecionado.push(resultado2);

		const nuevo2 = this._subsubtipo?.filter((p) => p.codigo !== _codigo2);

		this._subsubtipo = nuevo2;
	}
	onclick(): void {
		if (this.Form.invalid) {
			return;
		}
		if (!this.ediData) {
			const sendConsecutivoInv: ICreateAjsutesConfig = {
				CodAjusteConfig: this.codAjusteField.value as string,
				Descripcion: this.descripcionField.value as string,
				AjusteBase: this.ajusteField.value as string,
				Activa: this.activoField.value as boolean,
				Ingreso: this.funcionalidadField.value as string
			};
			this._save(sendConsecutivoInv);
			//Guardamos AjustesSubTipo
			//GUardamos AjustesSubSubTipo
		}
	}

	private _save(datos: ICreateAjsutesConfig): void {
		//Guardamos AjustesConfig
		this._transConfigurableApiService.createAjusteConfif(datos).subscribe({
			next: (response) => {
				if (response && response.success) {
					this.Form.reset();
					this._snotifyService.info('El registro se guardo sin problema');
					this._idAjusteConfig = response.result;
					//this._dialogRef.close('save');
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (e) => {
				console.log(e);
			}
		});
	}

	get codAjusteField(): AbstractControl {
		return this.Form.get('codAjuste')!;
	}
	get descripcionField(): AbstractControl {
		return this.Form.get('descripcion')!;
	}
	get ajusteField(): AbstractControl {
		return this.Form.get('ajuste')!;
	}
	get activoField(): AbstractControl {
		return this.Form.get('activo')!;
	}
	get funcionalidadField(): AbstractControl {
		return this.Form.get('funcionalidad')!;
	}
}
