import { AddPeriodoContablePageComponent } from './../add-periodo-contable-page/add-periodo-contable-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponsePeriodosContables } from './../../model/peridoContable-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { PeriodoContableApiService } from './../../services/periodo-contable-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-periodo-contable-page',
	templateUrl: './periodo-contable-page.component.html',
	styleUrls: ['./periodo-contable-page.component.scss']
})
export class PeriodoContablePageComponent implements OnInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _matDialog: MatDialog,
		private _periodoContableApiService: PeriodoContableApiService
	) {}

	listPeriodoContable = new MatTableDataSource<IResponsePeriodosContables>();
	displayedColumns: string[] = ['fechaFinal', 'Descripcion', 'Contabilidad', 'FinPeriodoAnual', 'Abierto', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'h2c';
	ngOnInit(): void {
		this._loadPeridoContable(1, 10000);
	}
	private _loadPeridoContable(page: number, rows: number): void {
		this._periodoContableApiService.getPeriodoContable(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listPeriodoContable.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('error');
			}
		});
	}
	openDialog(): void {
		this._matDialog
			.open(AddPeriodoContablePageComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadPeridoContable(1, 10000);
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listPeriodoContable.filter = filterValue.trim().toLocaleLowerCase();
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
						this._periodoContableApiService.deletePeriodoContable(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadPeridoContable(1, 10000);
							}
						});
					}
				}
			]
		});
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		this._matDialog
			.open(AddPeriodoContablePageComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadPeridoContable(1, 10000);
				}
			});
	}
}
