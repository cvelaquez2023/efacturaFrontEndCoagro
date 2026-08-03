import { MatPaginator } from '@angular/material/paginator';
import { IResponseUsuario } from './../../service/usuario-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnotifyService, SnotifyPosition } from 'ng-snotify';
import { UsuarioApiService } from '../../service/usuario-api.service';
import { MatSort } from '@angular/material/sort';
import { PrivilegiosComponent } from '../privilegios/privilegios.component';
import { AddComponent } from '../add/add.component';
@Component({
	selector: 'app-usuario-page',
	templateUrl: './usuario-page.component.html',
	styleUrls: ['./usuario-page.component.scss']
})
export class UsuarioPageComponent implements OnInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _UsuarioApiService: UsuarioApiService
	) {}
	listUsers = new MatTableDataSource<IResponseUsuario>();
	displayedColumns: string[] = [
		'fechaEmision',
		'tipoDte',
		'codGeneracion',
		'numControl',
		'selloRecibido',
		'estado',
		'nombreReceptor',
		'docReceptor',
		'montoTotal',
		'actions'
	];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchkey!: 'carlos';

	ngOnInit(): void {
		this._loadUser(1, 50000);
	}
	openDialog(): void {
		this._dialog
			.open(AddComponent, {
				width: '50%'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadUser(1, 5000);
				}
			});
	}

	private _loadUser(page: number, rows: number): void {
		this._UsuarioApiService.getAllUser(page, rows).subscribe({
			next: (response) => {
				if (response.success) {
					this.listUsers.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			},
			error: () => {
				console.log('errory');
			}
		});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listUsers.filter = filterValue.trim().toLowerCase();
	}
	clickDelete(id: number): void {
		console.log(id);
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		console.log(element);
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickPrivilegios(element: any): void {
		this._dialog
			.open(PrivilegiosComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'edit') {
					this._loadUser(1, 5000);
				}
			});
	}
}
