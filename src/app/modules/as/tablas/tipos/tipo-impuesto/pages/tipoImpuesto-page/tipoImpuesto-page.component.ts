import { OnInit } from '@angular/core';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { TipoImpuestoApiService } from '../../service/tipo-impuesto-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseTipoImpuesto } from '../../models/tipoImpuesto_api_model_interface';
import { AddTipoImpuestoComponent } from '../add-tipo-impuesto/add-tipo-impuesto.component';
import { AddTipoAnulacionComponent } from '../../../tipos-anulacion/pages/add-tipo-anulacion/add-tipo-anulacion.component';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'app-tipoImpuesto-page',
	templateUrl: './tipoImpuesto-page.component.html',
	styleUrls: ['./tipoImpuesto-page.component.scss']
})
export class TipoImpuestoPageComponent implements OnInit {
	/**
	 *
	 */
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _tipoImpuestoApiService: TipoImpuestoApiService
	) {}
	ngOnInit(): void {
		this._loadTipoImpuesto(1, 200000);
	}
	listTipoImpuesto = new MatTableDataSource<IResponseTipoImpuesto>();
	displayedColumns: string[] = ['codigo', 'nombre', 'activo', 'actions'];
	openDialog(): void {
		this.dialog
			.open(AddTipoImpuestoComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'save') {
					this._loadTipoImpuesto(1, 10000);
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listTipoImpuesto.filter = filterValue.trim().toLowerCase();
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
						this._tipoImpuestoApiService.delete(id).subscribe((response) => {
							if (response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadTipoImpuesto(1, 100000);
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
		this.dialog
			.open(AddTipoImpuestoComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'update') {
					this._loadTipoImpuesto(1, 10000);
				}
			});
	}
	private _loadTipoImpuesto(page: number, rows: number): void {
		this._tipoImpuestoApiService.get(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listTipoImpuesto.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
}
