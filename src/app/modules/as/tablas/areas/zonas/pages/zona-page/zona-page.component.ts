import { SnotifyService, SnotifyPosition } from 'ng-snotify';

import { AddComponent } from './../add/add.component';
import { IResponseZona } from './../../service/zona-api-model-interfaces';
import { ZonaApiService } from './../../service/zona-api.service';
import { Router } from '@angular/router';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
@Component({
	selector: 'app-zona-page',
	templateUrl: './zona-page.component.html',
	styleUrls: ['./zona-page.component.scss']
})
export class ZonaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _router: Router,
		private _zonaApiService: ZonaApiService
	) {}
	listZonas = new MatTableDataSource<IResponseZona>();
	displayedColumns: string[] = ['codZona', 'descripcion', 'activa', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	ngOnInit(): void {
		this._loadZona(1, 100000);
	}

	ngAfterViewInit(): void {
		this.listZonas.paginator = this.paginator;
		this.listZonas.sort = this.sort;
	}
	openDialog(): void {
		this.dialog
			.open(AddComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadZona(1, 100000);
				}
			});
	}

	private _loadZona(page: number, rows: number): void {
		this._zonaApiService.getZonas(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listZonas.data = response.result;
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
		this.listZonas.filter = filterValue.trim().toLowerCase();
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
						this._zonaApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadZona(1, 100000);
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
					this._loadZona(1, 100000);
				}
			});
	}
	private _acctionsSucces(): void {
		this.listZonas.data.length;
	}
}
