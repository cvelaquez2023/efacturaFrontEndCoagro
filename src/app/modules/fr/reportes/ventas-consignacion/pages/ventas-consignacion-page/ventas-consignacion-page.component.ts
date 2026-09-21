import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface IVentaConsignacion {
	cliente: string;
	ruta: string;
	articulo: string;
	cantidad: number;
	monto: number;
}

// Reporte solo visual (manual pag. 79): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IVentaConsignacion[] = [
	{ cliente: 'CL001', ruta: 'R001', articulo: 'ART001', cantidad: 10, monto: 145.5 },
	{ cliente: 'CL003', ruta: 'R002', articulo: 'ART002', cantidad: 4, monto: 58.0 }
];

@Component({
	selector: 'app-ventas-consignacion-page',
	templateUrl: './ventas-consignacion-page.component.html',
	styleUrls: ['./ventas-consignacion-page.component.scss']
})
export class VentasConsignacionPageComponent implements OnInit, AfterViewInit {
	constructor(private _formBuilder: FormBuilder) {}

	filtroForm!: FormGroup;
	resultados = new MatTableDataSource<IVentaConsignacion>();
	displayedColumns: string[] = ['cliente', 'ruta', 'articulo', 'cantidad', 'monto'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	ngOnInit(): void {
		this.filtroForm = this._formBuilder.group({ compania: ['COAGRO2'], rutas: [''], clientes: [''] });
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
