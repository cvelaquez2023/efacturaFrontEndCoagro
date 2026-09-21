import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface IVisitaDia {
	cliente: string;
	tipoDocumento: string;
	horaInicio: string;
	horaFin: string;
	duracionMin: number;
}

// Reporte solo visual (manual pag. 82): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IVisitaDia[] = [
	{ cliente: 'CL001', tipoDocumento: 'Factura', horaInicio: '2026-08-10T08:00:00', horaFin: '2026-08-10T08:20:00', duracionMin: 20 },
	{ cliente: 'CL002', tipoDocumento: 'Pedido', horaInicio: '2026-08-10T08:35:00', horaFin: '2026-08-10T08:50:00', duracionMin: 15 }
];
const CLIENTES_SIN_VISITA = ['CL003', 'CL004'];
const CLIENTES_FUERA_RUTA = ['CL005'];
const CLIENTES_SIN_VENTA = ['CL002'];

@Component({
	selector: 'app-visitas-dia-page',
	templateUrl: './visitas-dia-page.component.html',
	styleUrls: ['./visitas-dia-page.component.scss']
})
export class VisitasDiaPageComponent implements OnInit, AfterViewInit {
	constructor(private _formBuilder: FormBuilder) {}

	filtroForm!: FormGroup;
	resultados = new MatTableDataSource<IVisitaDia>();
	displayedColumns: string[] = ['cliente', 'tipoDocumento', 'horaInicio', 'horaFin', 'duracionMin'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	clientesSinVisita = CLIENTES_SIN_VISITA;
	clientesFueraRuta = CLIENTES_FUERA_RUTA;
	clientesSinVenta = CLIENTES_SIN_VENTA;

	ngOnInit(): void {
		this.filtroForm = this._formBuilder.group({ fecha: [new Date().toISOString().slice(0, 10)], ruta: [''], agente: [''] });
		this.resultados.data = MOCK_DATA;
	}

	ngAfterViewInit(): void {
		this.resultados.paginator = this.paginator;
		this.resultados.sort = this.sort;
	}

	generar(): void {
		this.resultados.data = MOCK_DATA;
	}
}
