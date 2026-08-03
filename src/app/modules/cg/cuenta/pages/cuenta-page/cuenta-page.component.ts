import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CuentacontableApiService } from '../../service/cuentacontable-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseCuentaContable } from '../../service/cuentacontable-api-model-interfaces';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AddCuentaComponent } from '../add-cuenta/add-cuenta.component';
import { error } from 'console';

@Component({
	selector: 'app-cuenta-page',
	templateUrl: './cuenta-page.component.html',
	styleUrls: ['./cuenta-page.component.scss']
})
export class CuentaPageComponent implements OnInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _cuentaService: CuentacontableApiService
	) {}
	listCuenta = new MatTableDataSource<IResponseCuentaContable>();
	displayedColumns: string[] = ['codCuentaContable', 'descripcion', 'tipo', 'tipoDetallado', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';
	ngOnInit(): void {
		this._loadCuenta(1, 10000);
	}
	openDialog(): void {
		this.dialog
			.open(AddCuentaComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'save') {
					this._loadCuenta(1, 1000);
				}
			});
	}
	private _loadCuenta(page: number, rows: number): void {
		this._cuentaService.getCuentaContable(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCuenta.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (error) => {
				console.log('error', error);
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listCuenta.filter = filterValue.trim().toLowerCase();
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this.dialog
			.open(AddCuentaComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadCuenta(1, 100000);
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
						this._cuentaService.deleteCuentaContable(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadCuenta(1, 100000);
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
