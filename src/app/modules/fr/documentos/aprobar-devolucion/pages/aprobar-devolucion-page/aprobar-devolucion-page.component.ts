import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { DetalleAprobarDevolucionComponent } from '../detalle-aprobar-devolucion/detalle-aprobar-devolucion.component';
import { IDevolucionFr } from '../../../devoluciones/model/devolucion-fr-model-interface';

// Pantalla solo visual: refleja "Aprobar Devolucion" del manual (pag. 73), disponible
// solo si el parametro "Utiliza Aprobacion de Devoluciones" esta activo. No hay backend real.
const MOCK_DEVOLUCIONES: (IDevolucionFr & { seleccionada: boolean })[] = [
	{ codigo: 'DEV0004', compania: 'COAGRO2', ruta: 'R001', cliente: 'CL001', bodega: 'BODV', documentoReferencia: 'FAC0060', estado: 'Nuevo', anulada: false, cantidadLineas: 2, fecha: '2026-08-08', lote: 'L-2026-08', seleccionada: false },
	{ codigo: 'DEV0005', compania: 'COAGRO2', ruta: 'R003', cliente: 'CL004', bodega: 'BODV', documentoReferencia: '', estado: 'Nuevo', anulada: false, cantidadLineas: 1, fecha: '2026-08-09', lote: 'L-2026-09', seleccionada: false },
	{ codigo: 'DEV0006', compania: 'COAGRO2', ruta: 'R002', cliente: 'CL002', bodega: 'BODV', documentoReferencia: 'FAC0071', estado: 'Aprobado', anulada: false, cantidadLineas: 4, fecha: '2026-08-04', lote: 'L-2026-08', seleccionada: false }
];

@Component({
	selector: 'app-aprobar-devolucion-page',
	templateUrl: './aprobar-devolucion-page.component.html',
	styleUrls: ['./aprobar-devolucion-page.component.scss']
})
export class AprobarDevolucionPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _dialog: MatDialog
	) {}

	listDevoluciones = new MatTableDataSource<IDevolucionFr & { seleccionada: boolean }>();
	displayedColumns: string[] = ['seleccionada', 'codigo', 'ruta', 'cliente', 'documentoReferencia', 'estado', 'fecha', 'actions'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	private _data = [...MOCK_DEVOLUCIONES];

	ngOnInit(): void {
		this.listDevoluciones.data = this._data;
	}

	ngAfterViewInit(): void {
		this.listDevoluciones.paginator = this.paginator;
		this.listDevoluciones.sort = this.sort;
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listDevoluciones.filter = filterValue.trim().toLowerCase();
	}

	verDetalle(element: IDevolucionFr): void {
		this._dialog.open(DetalleAprobarDevolucionComponent, { width: '45%', data: element });
	}

	aprobarSeleccionadas(): void {
		const seleccionadas = this._data.filter((item) => item.seleccionada && item.estado === 'Nuevo');
		if (!seleccionadas.length) {
			this._snotifyService.warning('Debe seleccionar al menos una devolucion en estado Nuevo', { position: SnotifyPosition.rightTop });
			return;
		}
		this._data = this._data.map((item) => (item.seleccionada ? { ...item, estado: 'Aprobado' as const, seleccionada: false } : item));
		this.listDevoluciones.data = this._data;
		this._snotifyService.info('Las devoluciones seleccionadas fueron aprobadas', { position: SnotifyPosition.rightTop });
	}
}
