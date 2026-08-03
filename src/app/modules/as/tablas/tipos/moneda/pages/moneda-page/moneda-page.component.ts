import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { MonedaApiService } from '../../service/moneda-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseMoneda } from '../../model/moneda-api-model-interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AddMonedaComponent } from '../add-moneda/add-moneda.component';

@Component({
	selector: 'app-moneda-page',
	templateUrl: './moneda-page.component.html',
	styleUrls: ['./moneda-page.component.scss']
})
export class MonedaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _MonedaApiService: MonedaApiService
	) {}
	ngAfterViewInit(): void {
		this.listMoneda.paginator = this.paginator;
		this.listMoneda.sort = this.sort;
	}
	ngOnInit(): void {
		this._loadMoneda(1, 10000);
	}
	listMoneda = new MatTableDataSource<IResponseMoneda>();
	displayedColumns: string[] = ['codigoMoneda', 'descripcion', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';

	private _loadMoneda(page: number, rows: number): void {
		this._MonedaApiService.getMoneda(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listMoneda.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	openDialog(): void {
		this._dialog
			.open(AddMonedaComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'save') {
					this._loadMoneda(1, 10000);
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listMoneda.filter = filterValue.trim().toLowerCase();
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this._dialog
			.open(AddMonedaComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'update') {
					this._loadMoneda(1, 10000);
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
						this._MonedaApiService.deleteMoneda(id).subscribe((response) => {
							if (response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadMoneda(1, 100000);
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
