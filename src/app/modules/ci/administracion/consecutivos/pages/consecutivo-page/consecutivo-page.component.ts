import { TransaccionesConfigurableConsecutivoPageComponent } from './../transaccionesConfigurableConsecutivo-page/transaccionesConfigurableConsecutivo-page.component';
import { AddConsecutivoPageComponent } from './../add-consecutivo-page/add-consecutivo-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { IResponseConsecutivoCi } from './../../model/IResponseConsecutivoCi';
import { MatTableDataSource } from '@angular/material/table';
import { ConsecutivoApiService } from './../../service/consecutivo-api.service';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Console } from 'console';
import { elementAt } from 'rxjs';
import { UsuariosConsecutivosPageComponent } from '../usuariosConsecutivos-page/usuariosConsecutivos-page.component';

@Component({
	selector: 'app-consecutivo-page',
	templateUrl: './consecutivo-page.component.html',
	styleUrls: ['./consecutivo-page.component.scss']
})
export class ConsecutivoPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private dialog: MatDialog,
		private _router: Router,
		private _consecutivoApiService: ConsecutivoApiService
	) {}
	ngAfterViewInit(): void {
		this.listConsecutivo.paginator = this.paginator;
		this.listConsecutivo.sort = this.sort;
	}
	listConsecutivo = new MatTableDataSource<IResponseConsecutivoCi>();
	displayedColumns: string[] = [
		'CodConsecutivo',
		'Descripcion',
		'Mascara',
		'SiguienteConsec',
		'Tipo',
		'UltimoUsuario',
		'UltFechaHora',
		'actions'
	];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	ngOnInit(): void {
		this._loadConsecutivoCI(1, 1000);
	}
	openDialog(): void {
		this.dialog
			.open(AddConsecutivoPageComponent, {
				width: '30%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadConsecutivoCI(1, 100000);
				}
			});
	}
	private _loadConsecutivoCI(page: number, rows: number): void {
		this._consecutivoApiService.getConsecutivoCI(page, rows).subscribe({
			next: (response) => {
				this.listConsecutivo.data = response.result;
			},
			error: () => {
				console.log('error');
			}
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listConsecutivo.filter = filterValue.trim().toLowerCase();
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
						this._consecutivoApiService.delete(id).subscribe((response) => {
							if (response && response.success) {
								this._snotifyService.info('El registro ha sido Eliminado');
								this._loadConsecutivoCI(1, 100000);
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
			.open(AddConsecutivoPageComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadConsecutivoCI(1, 100000);
				}
			});
	}
	private _acctionsSucces(): void {
		this.listConsecutivo.data.length;
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickTransacciones(element: any): void {
		this.dialog.open(TransaccionesConfigurableConsecutivoPageComponent, {
			width: '30%',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			data: element
		});
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickUsuario(element: any): void {
		this.dialog.open(UsuariosConsecutivosPageComponent, {
			width: '30%',
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			data: element
		});
	}
}
