import { UsuariosPageComponent } from './../usuarios-page/usuarios-page.component';
import { LocalizacionPageComponent } from './../localizacion-page/localizacion-page.component';
import { AddBodegaComponent } from './../add-bodega/add-bodega.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponseBodega } from './../../service/bodega-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { BodegaApiService } from './../../service/bodega-api.service';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-bodega-page',
	templateUrl: './bodega-page.component.html',
	styleUrls: ['./bodega-page.component.scss']
})
export class BodegaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _bodegaApiService: BodegaApiService
	) {}
	listBodega = new MatTableDataSource<IResponseBodega>();
	displayedColumns: string[] = ['codBodega', 'nombre', 'tipo', 'telefono', 'direccion', 'activo', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';
	ngOnInit(): void {
		this._loadBodega(1, 10000);
	}
	ngAfterViewInit(): void {
		this.listBodega.paginator = this.paginator;
		this.listBodega.sort = this.sort;
	}
	openDialog(): void {
		this._dialog
			.open(AddBodegaComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadBodega(1, 10000);
				}
			});
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	modalLocalizaciones(element: any): void {
		this._dialog
			.open(LocalizacionPageComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadBodega(1, 10000);
				}
			});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	modalUsuario(element: any): void {
		this._dialog
			.open(UsuariosPageComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadBodega(1, 10000);
				}
			});
	}
	private _loadBodega(page: number, rows: number): void {
		this._bodegaApiService.getBodega(page, rows).subscribe({
			next: (response) => {
				//console.log(response);
				if (response.success) {
					this.listBodega.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('erro');
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listBodega.filter = filterValue.trim().toLowerCase();
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
						this._bodegaApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadBodega(1, 100000);
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
			.open(AddBodegaComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'update') {
					this._loadBodega(1, 100000);
				}
			});
	}
}
