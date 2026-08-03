import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { RutaApiService } from './../../services/ruta-api.service';
import { IResponseRuta } from './../../services/ruta-api-model-interface';

import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';

@Component({
	selector: 'app-ruta-page',
	templateUrl: './ruta-page.component.html',
	styleUrls: ['./ruta-page.component.scss']
})
export class RutaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _router: Router,
		private _rutaApiService: RutaApiService
	) {}
	listRutas = new MatTableDataSource<IResponseRuta>();
	displayedColumns: string[] = ['codRuta', 'descripcion', 'activo', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	ngOnInit(): void {
		this._loadRuta(1, 10000);
	}

	ngAfterViewInit(): void {
		this.listRutas.paginator = this.paginator;
		this.listRutas.sort = this.sort;
	}
	openDialog(): void {
		this.dialog
			.open(AddComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadRuta(1, 100000);
				}
			});
	}
	private _loadRuta(page: number, rows: number): void {
		this._rutaApiService.getRutas(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listRutas.data = response.result;
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
		this.listRutas.filter = filterValue.trim().toLowerCase();
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
						this._rutaApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadRuta(1, 100000);
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
			.open(AddComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadRuta(1, 100000);
				}
			});
	}
}
