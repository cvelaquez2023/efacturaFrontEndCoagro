import { AddCatArticuloPageComponent } from './../add-cat-articulo-page/add-cat-articulo-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponseCategoriaArticulo } from './../../service/categoria-articulo-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { CategoriaArticuloApiService } from './../../service/categoria-articulo-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';

@Component({
	selector: 'app-categoriaarticulo-page',
	templateUrl: './categoriaarticulo-page.component.html',
	styleUrls: ['./categoriaarticulo-page.component.scss']
})
export class CategoriaarticuloPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _categoriaArticuloApiService: CategoriaArticuloApiService
	) {}

	listCatArticulo = new MatTableDataSource<IResponseCategoriaArticulo>();
	displayedColumns: string[] = ['codCategoriaArticulo', 'descripcion', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) MatPaginator!: MatPaginator;
	searchkey!: 'carlos';
	ngOnInit(): void {
		this._loadBodega(1, 10000);
	}
	ngAfterViewInit(): void {
		this.listCatArticulo.paginator = this.MatPaginator;
		this.listCatArticulo.sort = this.sort;
	}
	private _loadBodega(page: number, rows: number): void {
		this._categoriaArticuloApiService.getCatArticulo(page, rows).subscribe({
			next: (response) => {
				//console.log(response);
				this.listCatArticulo.data = response.result;
			},
			error: () => {
				console.log('erro');
			}
		});
	}
	openDialog(): void {
		this._dialog
			.open(AddCatArticuloPageComponent, {
				width: '50%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadBodega(1, 10000);
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listCatArticulo.filter = filterValue.trim().toLowerCase();
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
						this._categoriaArticuloApiService.delete(id).subscribe((response) => {
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
			.open(AddCatArticuloPageComponent, {
				width: '50%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadBodega(1, 100000);
				}
			});
	}
}
