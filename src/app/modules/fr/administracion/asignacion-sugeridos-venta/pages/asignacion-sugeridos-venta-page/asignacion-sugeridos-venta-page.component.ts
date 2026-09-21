import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { DetalleAsignacionSugeridoComponent } from '../detalle-asignacion-sugerido/detalle-asignacion-sugerido.component';
import { IAsignacionSugeridoFr } from '../../model/asignacion-sugerido-model-interface';

// Pantalla solo visual (manual pag. 108): no existe endpoint real.
const MOCK_ASIGNACIONES: IAsignacionSugeridoFr[] = [
	{ cliente: 'CL001', sugerido: 'SUG01' },
	{ cliente: 'CL002', sugerido: 'SUG02' },
	{ cliente: 'CL003', sugerido: 'SUG01' }
];

@Component({
	selector: 'app-asignacion-sugeridos-venta-page',
	templateUrl: './asignacion-sugeridos-venta-page.component.html',
	styleUrls: ['./asignacion-sugeridos-venta-page.component.scss']
})
export class AsignacionSugeridosVentaPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog
	) {}

	listAsignaciones = new MatTableDataSource<IAsignacionSugeridoFr>();
	displayedColumns: string[] = ['cliente', 'sugerido', 'actions'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	private _data: IAsignacionSugeridoFr[] = [...MOCK_ASIGNACIONES];

	ngOnInit(): void {
		this.listAsignaciones.data = this._data;
	}

	ngAfterViewInit(): void {
		this.listAsignaciones.paginator = this.paginator;
		this.listAsignaciones.sort = this.sort;
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listAsignaciones.filter = filterValue.trim().toLowerCase();
	}

	openDialog(): void {
		this._dialog
			.open(DetalleAsignacionSugeridoComponent, { width: '50%' })
			.afterClosed()
			.subscribe((result: IAsignacionSugeridoFr) => {
				if (result) {
					this._data = [...this._data, result];
					this.listAsignaciones.data = this._data;
					this._snotifyService.info('El registro se guardo sin problema', { position: SnotifyPosition.rightTop });
				}
			});
	}

	clickEdit(element: IAsignacionSugeridoFr): void {
		this._dialog
			.open(DetalleAsignacionSugeridoComponent, { width: '50%', data: element })
			.afterClosed()
			.subscribe((result: IAsignacionSugeridoFr) => {
				if (result) {
					this._data = this._data.map((item) => (item.cliente === element.cliente ? result : item));
					this.listAsignaciones.data = this._data;
					this._snotifyService.info('El registro se actualizo sin problema', { position: SnotifyPosition.rightTop });
				}
			});
	}
}
