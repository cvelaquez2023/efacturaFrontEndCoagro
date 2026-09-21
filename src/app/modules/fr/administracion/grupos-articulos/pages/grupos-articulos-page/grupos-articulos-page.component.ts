import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { GrupoArticuloApiService } from '../../service/grupo-articulo-api.service';
import { IResponseGrupoArticulo } from '../../model/grupo-articulo-fr-model-interface';
import { AddGrupoArticuloComponent } from '../add-grupo-articulo/add-grupo-articulo.component';

@Component({
	selector: 'app-grupos-articulos-page',
	templateUrl: './grupos-articulos-page.component.html',
	styleUrls: ['./grupos-articulos-page.component.scss']
})
export class GruposArticulosPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog,
		private _grupoArticuloApiService: GrupoArticuloApiService
	) {}

	listGrupos = new MatTableDataSource<IResponseGrupoArticulo>();
	displayedColumns: string[] = ['grupo', 'descripcion', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	ngOnInit(): void {
		this._loadGrupos();
	}

	ngAfterViewInit(): void {
		this.listGrupos.paginator = this.paginator;
		this.listGrupos.sort = this.sort;
	}

	private _loadGrupos(): void {
		this._grupoArticuloApiService.getGruposArticulo().subscribe({
			next: (response) => {
				if (response.success) {
					this.listGrupos.data = response.result;
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
			}
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listGrupos.filter = filterValue.trim().toLowerCase();
	}

	openDialog(): void {
		this._dialog
			.open(AddGrupoArticuloComponent, {
				width: '650px',
				maxWidth: '95vw',
				maxHeight: '90vh'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadGrupos();
				}
			});
	}

	clickEdit(element: IResponseGrupoArticulo): void {
		this._dialog
			.open(AddGrupoArticuloComponent, {
				width: '650px',
				maxWidth: '95vw',
				maxHeight: '90vh',
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'update') {
					this._loadGrupos();
				}
			});
	}

	clickDelete(grupoArticulo: string): void {
		this._snotifyService.confirm('¿Está seguro de eliminar el registro?', {
			position: SnotifyPosition.rightTop,
			buttons: [
				{
					text: 'SI',
					bold: true,
					action: (toast) => {
						this._snotifyService.remove(toast.id);
						this._grupoArticuloApiService.deleteGrupoArticulo(grupoArticulo).subscribe((response) => {
							if (response.success) {
								this._snotifyService.info('El registro ha sido eliminado');
								this._loadGrupos();
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
}
