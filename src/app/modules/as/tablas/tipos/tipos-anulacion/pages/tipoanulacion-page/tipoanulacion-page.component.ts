/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { TipoAnulacionApiService } from '../../Service/tipo-anulacion-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseTipoAnulacion } from '../../models/tipoAnulacion-api-model-interface';
import { AddTipoAnulacionComponent } from '../add-tipo-anulacion/add-tipo-anulacion.component';

@Component({
	selector: 'app-tipoanulacion-page',
	templateUrl: './tipoanulacion-page.component.html',
	styleUrls: ['./tipoanulacion-page.component.scss']
})
export class TipoanulacionPageComponent implements OnInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _tipoAnulacionApoService: TipoAnulacionApiService
	) {}
	ngOnInit(): void {
		this._loadTipoAnulacion(1, 200000);
	}
	listTipoAnulacion = new MatTableDataSource<IResponseTipoAnulacion>();
	displayedColumns: string[] = ['codigo', 'nombre', 'activo', 'actions'];

	openDialog(): void {
		this.dialog
			.open(AddTipoAnulacionComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'save') {
					this._loadTipoAnulacion(1, 10000);
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listTipoAnulacion.filter = filterValue.trim().toLowerCase();
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
						this._tipoAnulacionApoService.delete(id).subscribe((response) => {
							if (response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadTipoAnulacion(1, 100000);
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
			.open(AddTipoAnulacionComponent, {
				width: '30%',
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val == 'update') {
					this._loadTipoAnulacion(1, 10000);
				}
			});
	}
	private _loadTipoAnulacion(page: number, rows: number): void {
		this._tipoAnulacionApoService.get(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listTipoAnulacion.data = response.result;
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
