/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { ImpuestoApiService } from '../../service/impuesto-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { ImpuestoModelConsulta } from '../../model/impuesto-model';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AddCodimpuestoComponent } from '../add-codimpuesto/add-codimpuesto.component';

@Component({
	selector: 'app-cod-impuesto-page',
	templateUrl: './cod-impuesto-page.component.html',
	styleUrls: ['./cod-impuesto-page.component.scss']
})
export class CodImpuestoPageComponent implements OnInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _impuestoApiService: ImpuestoApiService
	) {}
	ngOnInit(): void {
		this._loadImpuesto(1, 10000000);
	}
	listImpuesto = new MatTableDataSource<ImpuestoModelConsulta>();
	displayedColumns: string[] = ['codigo', 'descripcion', 'impuesto1', 'impuesto2', 'activo', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	openDialog(): void {
		this._dialog
			.open(AddCodimpuestoComponent, { width: '60%' })
			.afterClosed()
			.subscribe((val) => {
				if (val == 'save') {
					this._loadImpuesto(1, 10000);
				}
			});
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listImpuesto.filter = filterValue.trim().toLowerCase();
	}
	private _loadImpuesto(page: number, rows: number): void {
		this._impuestoApiService.getImpuesto(page, rows).subscribe({
			next: (response) => {
				console.log(response);
				if (response.success) {
					this.listImpuesto.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	clickEdit(element: any): void {
		this._dialog
			.open(AddCodimpuestoComponent, {
				width: '60%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'update') {
					this._loadImpuesto(1, 100000);
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
						this._impuestoApiService.deleteImpuesto(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadImpuesto(1, 1000);
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
