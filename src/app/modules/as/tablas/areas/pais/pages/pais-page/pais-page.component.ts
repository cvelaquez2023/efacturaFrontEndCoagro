import { AddPaisComponent } from './../add-pais/add-pais.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IConsultaPais } from './../../service/pais-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { PaisApiService } from './../../service/pais-api.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-pais-page',
	templateUrl: './pais-page.component.html',
	styleUrls: ['./pais-page.component.scss']
})
export class PaisPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _router: Router,
		private _paisService: PaisApiService
	) {}
	listPais = new MatTableDataSource<IConsultaPais>();
	displayedColumns: string[] = ['codPais', 'nombre', 'codigoISO', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';

	ngAfterViewInit(): void {
		this.listPais.paginator = this.paginator;
		this.listPais.sort = this.sort;
	}
	ngOnInit(): void {
		this._loadPais(1, 10000);
	}

	private _loadPais(page: number, rows: number): void {
		this._paisService.getPaises(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listPais.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listPais.filter = filterValue.trim().toLowerCase();
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
						this._paisService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadPais(1, 100000);
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
			.open(AddPaisComponent, {
				width: '50%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadPais(1, 100000);
				}
			});
	}
	private _acctionsSucces(): void {
		this.listPais.data.length;
	}
	openDialog(): void {
		this.dialog
			.open(AddPaisComponent, {
				width: '50%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadPais(1, 100000);
				}
			});
	}
}
