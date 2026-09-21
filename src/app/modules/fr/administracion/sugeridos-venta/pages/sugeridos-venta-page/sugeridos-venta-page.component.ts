import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { AddSugeridoVentaComponent } from '../add-sugerido-venta/add-sugerido-venta.component';
import { ISugeridoVentaFr } from '../../model/sugerido-venta-fr-model-interface';

const MOCK_SUGERIDOS: ISugeridoVentaFr[] = [
	{ sugerido: 'SUG01', descripcion: 'Sugerido Fertilizantes Temporada' },
	{ sugerido: 'SUG02', descripcion: 'Sugerido Agroquimicos Basicos' },
	{ sugerido: 'SUG03', descripcion: 'Sugerido Semillas Maiz' }
];

@Component({
	selector: 'app-sugeridos-venta-page',
	templateUrl: './sugeridos-venta-page.component.html',
	styleUrls: ['./sugeridos-venta-page.component.scss']
})
export class SugeridosVentaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog
	) {}

	listSugeridos = new MatTableDataSource<ISugeridoVentaFr>();
	displayedColumns: string[] = ['sugerido', 'descripcion', 'actions'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	private _data: ISugeridoVentaFr[] = [...MOCK_SUGERIDOS];

	ngOnInit(): void {
		this.listSugeridos.data = this._data;
	}

	ngAfterViewInit(): void {
		this.listSugeridos.paginator = this.paginator;
		this.listSugeridos.sort = this.sort;
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listSugeridos.filter = filterValue.trim().toLowerCase();
	}

	openDialog(): void {
		this._dialog
			.open(AddSugeridoVentaComponent, { width: '35%' })
			.afterClosed()
			.subscribe((result: ISugeridoVentaFr) => {
				if (result) {
					this._data = [...this._data, result];
					this.listSugeridos.data = this._data;
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
				}
			});
	}

	clickEdit(element: ISugeridoVentaFr): void {
		this._dialog
			.open(AddSugeridoVentaComponent, { width: '35%', data: element })
			.afterClosed()
			.subscribe((result: ISugeridoVentaFr) => {
				if (result) {
					this._data = this._data.map((item) => (item.sugerido === element.sugerido ? result : item));
					this.listSugeridos.data = this._data;
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
				}
			});
	}

	clickDelete(element: ISugeridoVentaFr): void {
		this._snotifyService.confirm('Esta seguro de eliminar el registro?', {
			position: SnotifyPosition.rightTop,
			buttons: [
				{
					text: 'SI',
					bold: true,
					action: (toast) => {
						this._snotifyService.remove(toast.id);
						this._data = this._data.filter((item) => item.sugerido !== element.sugerido);
						this.listSugeridos.data = this._data;
						this._snotifyService.info('El registro ha sido eliminado');
					}
				},
				{ text: 'CANCELAR' }
			]
		});
	}
}
