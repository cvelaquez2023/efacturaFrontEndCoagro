import { AddcondicionpagoPageComponent } from './../addcondicionpago-page/addcondicionpago-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ICondicionPagoConsulta, ICondicionPagoEdit } from './../../models/condicionPago-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { CondicionPagoApiService } from './../../service/condicionPago-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-condicionpago-page',
	templateUrl: './condicionpago-page.component.html',
	styleUrls: ['./condicionpago-page.component.scss']
})
export class CondicionpagoPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _condicionPagoApiService: CondicionPagoApiService
	) {}
	lista = new MatTableDataSource<ICondicionPagoConsulta>();
	displayedColumns: string[] = ['codCondicionPago', 'descripcion', 'diasNeto', 'activa', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	ngAfterViewInit(): void {
		this.lista.paginator = this.paginator;
		this.lista.sort = this.sort;
	}

	ngOnInit(): void {
		this._loadCondicionPago(1, 200000);
	}
	openDialog(): void {
		this._dialog
			.open(AddcondicionpagoPageComponent, { width: '40%' })
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadCondicionPago(1, 1000);
				}
			});
	}
	private _loadCondicionPago(page: number, rows: number): void {
		this._condicionPagoApiService.getCondicionPago(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.lista.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: (err) => {
				console.log('error', err);
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.lista.filter = filterValue.trim().toLowerCase();
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
						this._condicionPagoApiService.deleteCondicionPago(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadCondicionPago(1, 1000);
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
	clickEdit(element: ICondicionPagoConsulta): void {
		this._dialog
			.open(AddcondicionpagoPageComponent, { width: '40%', data: element })
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadCondicionPago(1, 1000);
				}
			});
	}
}
