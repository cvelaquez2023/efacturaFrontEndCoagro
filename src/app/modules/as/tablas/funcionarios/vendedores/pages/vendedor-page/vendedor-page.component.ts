import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponseVendedor } from './../../services/vendedor-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { VendedorApiService } from './../../services/vendedor-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';

@Component({
	selector: 'app-vendedor-page',
	templateUrl: './vendedor-page.component.html',
	styleUrls: ['./vendedor-page.component.scss']
})
export class VendedorPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _vendedorApiService: VendedorApiService
	) {}

	listVendedores = new MatTableDataSource<IResponseVendedor>();
	displayedColumns: string[] = ['codVendedor', 'nombre', 'email', 'activo', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	ngOnInit(): void {
		this._loadVendedor(1, 100000);
	}
	ngAfterViewInit(): void {
		this.listVendedores.paginator = this.paginator;
		this.listVendedores.sort = this.sort;
	}
	openDialog(): void {
		this._dialog
			.open(AddComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadVendedor(1, 10000);
				}
			});
	}

	private _loadVendedor(page: number, rows: number): void {
		this._vendedorApiService.getVendedor(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listVendedores.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listVendedores.filter = filterValue.trim().toLowerCase();
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
						this._vendedorApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadVendedor(1, 100000);
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
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this._dialog
			.open(AddComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadVendedor(1, 100000);
				}
			});
	}
}
