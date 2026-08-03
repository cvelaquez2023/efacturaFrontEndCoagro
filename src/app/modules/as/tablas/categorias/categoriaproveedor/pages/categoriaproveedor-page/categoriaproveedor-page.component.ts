import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CtaProveedorApiService } from '../../service/cta-proveedor-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseCtaProveedor } from '../../model/ctaProveedor-api-model-interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AddCatProveedorPageComponent } from '../add-cat-proveedor-page/add-cat-proveedor-page.component';

@Component({
	selector: 'app-categoriaproveedor-page',
	templateUrl: './categoriaproveedor-page.component.html',
	styleUrls: ['./categoriaproveedor-page.component.scss']
})
export class CategoriaproveedorPageComponent implements OnInit, AfterViewInit {
	/**
	 *
	 */
	constructor(
		private _ctaProveedorApiService: CtaProveedorApiService,
		private _dialog: MatDialog,
		private _snotifyService: SnotifyService
	) {}
	ngAfterViewInit(): void {
		this.listCategoriaProveedor.paginator = this.MatPaginator;
		this.listCategoriaProveedor.sort = this.sort;
	}
	ngOnInit(): void {
		this._loadCategoriaProveedor();
	}
	listCategoriaProveedor = new MatTableDataSource<IResponseCtaProveedor>();
	displayedColumns: string[] = ['codCategoriaProveedor', 'descripcion', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) MatPaginator!: MatPaginator;
	searchkey!: 'demo';
	private _loadCategoriaProveedor(): void {
		this._ctaProveedorApiService.getCategoriaProveedor(1, 10000).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCategoriaProveedor.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	openDialog(): void {
		this._dialog
			.open(AddCatProveedorPageComponent, {
				width: '50%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'save') {
					this._loadCategoriaProveedor();
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listCategoriaProveedor.filter = filterValue.trim().toLowerCase();
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this._dialog
			.open(AddCatProveedorPageComponent, {
				width: '50%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'edit') {
					this._loadCategoriaProveedor();
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
						this._ctaProveedorApiService.deleteCategoriaProveedor(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadCategoriaProveedor();
							} else {
								this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
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
}
