import { elementAt } from 'rxjs';
import {
	IResponseArticulo,
	IRequestCreateArticulo,
	IResquestConsultarArticulo
} from '../../model/articulo-api-model-interface';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IResponseBodega } from './../../../../as/tablas/otros/bodega/service/bodega-api-model-interface';
import { BodegaApiService } from './../../../../as/tablas/otros/bodega/service/bodega-api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
	IResponseConsultarExistenciaBodega,
	IResponseCreateExistenciaBodega
} from './../../../../as/tablas/otros/bodega/service/existenciaBodega-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { ExistenciaBodegaApiService } from './../../../../as/tablas/otros/bodega/service/existenciaBodega-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-add-articulo-bodega-page',
	templateUrl: './add-articulo-bodega-page.component.html',
	styleUrls: ['./add-articulo-bodega-page.component.scss']
})
export class AddArticuloBodegaPageComponent implements OnInit {
	constructor(
		private _formBuilder: FormBuilder,
		private _snotifyService: SnotifyService,
		private _existenciaBodegaApiService: ExistenciaBodegaApiService,
		private _bodegaApiService: BodegaApiService,
		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
		@Inject(MAT_DIALOG_DATA) public editData: IResquestConsultarArticulo,
		private _dialogRef: MatDialogRef<AddArticuloBodegaPageComponent>
	) {
		this._loadFormGroup();
	}
	listBodega = new MatTableDataSource<IResponseConsultarExistenciaBodega>();
	displayedColumns: string[] = ['codBodega', 'nombre', 'existenciaMi', 'puntoReorden', 'existenciaMa', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';
	listBodegas: IResponseBodega[] = [];
	formGroup!: FormGroup;

	// eslint-disable-next-line @typescript-eslint/no-inferrable-types
	actionBtn: string = 'Adicionar';
	guardar = true;
	existenciaBodegaId!: number;
	arrayElement!: {
		cantiDisponible: number;
		cantReservada: number;
		cantNoAprobada: number;
		cantVencida: number;
		cantTransito: number;
		cantProduccion: number;
		cantPedida: number;
		cantRemitida: number;
		congelado: boolean;
		fechaCong: string;
		bloqueaTrans: boolean;
		fechaDescong: string;
		costoUntPromedioDol: number;
		costoUntPromedioLoc: number;
	};
	ngOnInit(): void {
		setTimeout(() => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (this.editData.activo) {
				this._loadExistenciaBodega(1, 10000);
				this._loadBodega(1, 1000);
			} else {
				this._snotifyService.info('El Articulo Tiene que estar Activo', { position: SnotifyPosition.rightTop });
				this._dialogRef.close();
			}
		}, 0);
	}

	//Cargamos los inpus del formulario
	private _loadFormGroup(): void {
		this.formGroup = this._formBuilder.group({
			bodega: [null, Validators.required],
			existenciaMin: [null, Validators.required],
			puntoReorden: [null, Validators.required],
			existenciaMax: [null, Validators.required]
		});
	}
	adicionar(): void {
		if (this.formGroup.invalid) {
			return;
		}
		if (this.guardar) {
			const sendExistenciaBodega: IResponseCreateExistenciaBodega = {
				bodegaId: this.bodegaField.value as number,
				articuloId: this.editData.id,
				existenciaMinima: this.existenciaMinField.value as number,
				puntoDeOrden: this.puntoReordenField.value as number,
				existenciaMaxima: this.existenciaMaxField.value as number
			};
			this._save(sendExistenciaBodega);
		} else {
			const sendExistenciaBodega: IResponseConsultarExistenciaBodega = {
				bodegaId: this.bodegaField.value as number,
				articuloId: this.editData.id,
				existenciaMinima: this.existenciaMinField.value as number,
				puntoDeOrden: this.puntoReordenField.value as number,
				existenciaMaxima: this.existenciaMaxField.value as number,
				id: this.existenciaBodegaId,
				cantDisponible: this.arrayElement.cantiDisponible,
				cantReservada: this.arrayElement.cantReservada,
				cantNoAprobada: this.arrayElement.cantNoAprobada,
				cantVencida: this.arrayElement.cantVencida,
				cantTransito: this.arrayElement.cantTransito,
				cantProduccion: this.arrayElement.cantProduccion,
				cantPedida: this.arrayElement.cantPedida,
				cantRemitida: this.arrayElement.cantRemitida,
				congelado: this.arrayElement.congelado,
				fechaCong: this.arrayElement.fechaCong,
				fechaDescong: this.arrayElement.fechaDescong,
				costoUntPromedioLoc: this.arrayElement.costoUntPromedioLoc,
				costoUntPromedioDol: this.arrayElement.costoUntPromedioDol,
				bloqueaTrans: this.arrayElement.bloqueaTrans
			};
			this._update(sendExistenciaBodega);
		}
	}

	private _save(existencia: IResponseCreateExistenciaBodega) {
		this._existenciaBodegaApiService.crearExistenciaBodega(existencia).subscribe({
			next: (response) => {
				if (response.success) {
					this.formGroup.reset();
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
					this._loadExistenciaBodega(1, 10000);
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	private _update(existencia: IResponseCreateExistenciaBodega) {
		this._existenciaBodegaApiService.updateExistenciaBodega(this.existenciaBodegaId, existencia).subscribe({
			next: (response) => {
				this.formGroup.reset();
				this._snotifyService.info('El registro Actualizdo ', { position: SnotifyPosition.rightTop });
				this._loadExistenciaBodega(1, 10000);
			},
			error: () => {
				console.log('error');
			}
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listBodega.filter = filterValue.trim().toLowerCase();
	}
	private _loadExistenciaBodega(page: number, rows: number): void {
		this._existenciaBodegaApiService.getExistenciaBodega(page, rows).subscribe({
			next: (response) => {
				const resultado = response.result.filter((e) => e.articuloId == this.editData.id);
				this.listBodega.data = resultado;
			},
			error: () => {
				console.log('erro');
			}
		});
	}
	private _loadBodega(page: number, rows: number): void {
		this._bodegaApiService.getBodega(page, rows).subscribe({
			next: (response) => {
				this.listBodegas = response.result;
			},
			error: () => {
				console.log('erro');
			}
		});
	}

	clickEdit(element: IResponseConsultarExistenciaBodega): void {
		this.actionBtn = 'Actualizar';
		this.formGroup.controls['bodega'].setValue(element.bodegaId);
		this.formGroup.controls['bodega'].disable();
		this.formGroup.controls['existenciaMin'].setValue(element.existenciaMinima);
		this.formGroup.controls['puntoReorden'].setValue(element.puntoDeOrden);
		this.formGroup.controls['existenciaMax'].setValue(element.existenciaMaxima);
		this.guardar = false;
		this.existenciaBodegaId = element.id;
		this.arrayElement = {
			cantiDisponible: element.cantDisponible,
			cantReservada: element.cantReservada,
			cantNoAprobada: element.cantNoAprobada,
			cantVencida: element.cantVencida,
			cantTransito: element.cantTransito,
			cantProduccion: element.cantProduccion,
			cantPedida: element.cantPedida,
			cantRemitida: element.cantRemitida,
			congelado: element.congelado,
			fechaCong: element.fechaCong,
			bloqueaTrans: element.bloqueaTrans,
			fechaDescong: element.fechaDescong,
			costoUntPromedioDol: element.costoUntPromedioDol,
			costoUntPromedioLoc: element.costoUntPromedioLoc
		};
	}

	private _editar(): void {
		console.log('editar');
	}
	clickDelete(): void {
		console.log('elimimamos');
	}

	get bodegaField(): AbstractControl {
		return this.formGroup.get('bodega')!;
	}
	get existenciaMinField(): AbstractControl {
		return this.formGroup.get('existenciaMin')!;
	}
	get puntoReordenField(): AbstractControl {
		return this.formGroup.get('puntoReorden')!;
	}
	get existenciaMaxField(): AbstractControl {
		return this.formGroup.get('existenciaMax')!;
	}
}
