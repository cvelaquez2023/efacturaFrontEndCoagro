import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IResponseCobrador } from './../../services/cobrador-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { CobradorApiService } from './../../services/cobrador-api.service';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AddComponent } from '../add/add.component';

@Component({
	selector: 'app-cobrador-page',
	templateUrl: './cobrador-page.component.html',
	styleUrls: ['./cobrador-page.component.scss']
})
export class CobradorPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _cobradorApiService: CobradorApiService
	) {}

	listCobradores = new MatTableDataSource<IResponseCobrador>();
	displayedColumns: string[] = ['codCobrador', 'nombre', 'email', 'activo', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	ngOnInit(): void {
		this._loadCobrador(1, 10000);
	}
	ngAfterViewInit(): void {
		this.listCobradores.paginator = this.paginator;
		this.listCobradores.sort = this.sort;
	}
	openDialog(): void {
		this.dialog
			.open(AddComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadCobrador(1, 10000);
				}
			});
	}
	private _loadCobrador(page: number, rows: number): void {
		this._cobradorApiService.getCobrador(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listCobradores.data = response.result;
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
		this.listCobradores.filter = filterValue.trim().toLowerCase();
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
						this._cobradorApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadCobrador(1, 100000);
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
				if (val === 'update') {
					this._loadCobrador(1, 100000);
				}
			});
	}
}
