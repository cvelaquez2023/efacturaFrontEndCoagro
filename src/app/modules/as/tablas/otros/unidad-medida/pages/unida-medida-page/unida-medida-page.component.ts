import { AddUnidaMedidaPageComponent } from './../add-unida-medida-page/add-unida-medida-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { ICreateUnidadMedida, IResponseUnidadMedida } from './../../service/unidad-medida-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { UnidadMedidaApiService } from './../../service/unidad-medida-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';

@Component({
	selector: 'app-unida-medida-page',
	templateUrl: './unida-medida-page.component.html',
	styleUrls: ['./unida-medida-page.component.scss']
})
export class UnidaMedidaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _unidadMedidaApiService: UnidadMedidaApiService
	) {}

	listDatos = new MatTableDataSource<IResponseUnidadMedida>();
	displayedColumns: string[] = ['codUnidadMedida', 'descripcion', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';

	ngOnInit(): void {
		this._loadData(1, 1000);
	}

	ngAfterViewInit(): void {
		this.listDatos.paginator = this.paginator;
		this.listDatos.sort = this.sort;
	}
	openDialog(): void {
		this._dialog
			.open(AddUnidaMedidaPageComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadData(1, 10000);
				}
			});
	}

	private _loadData(page: number, rows: number): void {
		this._unidadMedidaApiService.getUnidadMedida(page, rows).subscribe({
			next: (response) => {
				this.listDatos.data = response.result;
			},
			error: () => {
				console.log('erro');
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listDatos.filter = filterValue.trim().toLowerCase();
	}

	clickDelete(id: number): void {
		this._snotifyService.confirm('Esta seguro de eliminar el registro?', {
			position: SnotifyPosition.rightTop,
			buttons: [
				{
					text: 'SI',
					bold: true,
					action: (toast) => {
						this._snotifyService.remove(toast.id);
						this._unidadMedidaApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadData(1, 100000);
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
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this._dialog
			.open(AddUnidaMedidaPageComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadData(1, 100000);
				}
			});
	}
}
