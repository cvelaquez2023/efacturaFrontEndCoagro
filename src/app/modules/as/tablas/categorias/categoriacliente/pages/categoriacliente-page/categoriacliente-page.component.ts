import { AddCatClientePageComponent } from './../add-cat-cliente-page/add-cat-cliente-page.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponseCatCliente } from './../../model/catCliente-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { CatClienteApiService } from './../../services/cat-cliente-api.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';

@Component({
	selector: 'app-categoriacliente-page',
	templateUrl: './categoriacliente-page.component.html',
	styleUrls: ['./categoriacliente-page.component.scss']
})
export class CategoriaclientePageComponent implements OnInit, AfterViewInit {
	constructor(
		private _catClienteApiService: CatClienteApiService,
		private _dialog: MatDialog,
		private _snotifyService: SnotifyService
	) {}

	listCategoriaCliente = new MatTableDataSource<IResponseCatCliente>();
	displayedColumns: string[] = ['codCategoriaCliente', 'descripcion', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) MatPaginator!: MatPaginator;
	searchKey!: 'carlos';
	ngOnInit(): void {
		this._loadCategoriaClientes();
	}
	ngAfterViewInit(): void {
		this.listCategoriaCliente.paginator = this.MatPaginator;
		this.listCategoriaCliente.sort = this.sort;
	}

	private _loadCategoriaClientes(): void {
		this._catClienteApiService.getCategoriaCliente(1, 1000).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCategoriaCliente.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	openDialog(): void {
		this._dialog
			.open(AddCatClientePageComponent, {
				width: '50%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadCategoriaClientes();
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listCategoriaCliente.filter = filterValue.trim().toLowerCase();
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this._dialog
			.open(AddCatClientePageComponent, {
				width: '50%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadCategoriaClientes();
				}
			});
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
						this._catClienteApiService.deleteCategoriaCliente(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadCategoriaClientes();
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
