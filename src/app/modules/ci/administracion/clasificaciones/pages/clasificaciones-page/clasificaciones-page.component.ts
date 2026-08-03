import { ClasificacionApiService } from './../../services/clasificacion-api.service';
import { AddClasificacionesPageComponent } from './../add-clasificaciones-page/add-clasificaciones-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IResponseClasificacion } from '../../services/clasificacion-api-model-interface';

@Component({
	selector: 'app-clasificaciones-page',
	templateUrl: './clasificaciones-page.component.html',
	styleUrls: ['./clasificaciones-page.component.scss']
})
export class ClasificacionesPageComponent implements AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _router: Router,
		private _clasificacionApiService: ClasificacionApiService
	) {}

	listDatos = new MatTableDataSource<IResponseClasificacion>();
	displayedColumns: string[] = ['codClasificacion', 'descripcion', 'medida', 'tipo', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';

	ngAfterViewInit(): void {
		this.listDatos.paginator = this.paginator;
		this.listDatos.sort = this.sort;
	}
	openDialog(): void {
		this.dialog
			.open(AddClasificacionesPageComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadDatos(1, 100000);
				}
			});
	}

	private _loadDatos(page: number, rows: number): void {
		this._clasificacionApiService.getClasifi(page, rows).subscribe({
			next: (response) => {
				this.listDatos.data = response.result;
			},
			error: () => {
				console.log('error');
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
						this._clasificacionApiService.getClasifi(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadDatos(1, 100000);
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
		this.dialog
			.open(AddClasificacionesPageComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadDatos(1, 100000);
				}
			});
	}
	private _acctionsSucces(): void {
		this.listDatos.data.length;
	}
}
