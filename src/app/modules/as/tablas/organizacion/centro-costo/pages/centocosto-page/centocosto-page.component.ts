import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { CentrocostoApiService } from '../../service/centrocosto-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { IRequestCentroCosto } from '../../service/centrocosto-api-model-interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AddComponent } from '../add/add.component';

@Component({
	selector: 'app-centocosto-page',
	templateUrl: './centocosto-page.component.html',
	styleUrls: ['./centocosto-page.component.scss']
})
export class CentocostoPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _centoCostoApiService: CentrocostoApiService
	) {}
	listCentroCosto = new MatTableDataSource<IRequestCentroCosto>();
	displayedColumns: string[] = ['codCentroCosto', 'descripcion', 'tipo', 'aceptaDatos', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';
	ngAfterViewInit(): void {
		this.listCentroCosto.paginator = this.paginator;
		this.listCentroCosto.sort = this.sort;
	}
	ngOnInit(): void {
		this._loadCentroCosto(1, 100000);
	}
	openDialog(): void {
		this._dialog
			.open(AddComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadCentroCosto(1, 10000);
				}
			});
	}

	private _loadCentroCosto(page: number, rows: number): void {
		this._centoCostoApiService.getCentroCosto(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCentroCosto.data = response.result;
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
		this.listCentroCosto.filter = filterValue.trim().toLowerCase();
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
						this._centoCostoApiService.deleteCentroCosto(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadCentroCosto(1, 100000);
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
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
	clickEdit(element: any): void {
		this._dialog
			.open(AddComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'update') {
					this._loadCentroCosto(1, 100000);
				}
			});
	}
}
