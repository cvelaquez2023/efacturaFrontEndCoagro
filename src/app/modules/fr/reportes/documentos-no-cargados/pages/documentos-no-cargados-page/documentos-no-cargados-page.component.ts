import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface IDocumentoNoCargado {
	tipoDocumento: string;
	ruta: string;
	rutero: string;
	consecutivo: string;
	cliente: string;
	fechaDocumento: string;
	fechaSincronizacion: string;
}

// Reporte solo visual (manual pag. 75): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IDocumentoNoCargado[] = [
	{ tipoDocumento: 'Factura', ruta: 'R001', rutero: 'AG01', consecutivo: 'FAC0045', cliente: 'CL001', fechaDocumento: '2026-08-08', fechaSincronizacion: '2026-08-08' },
	{ tipoDocumento: 'Pedido', ruta: 'R002', rutero: 'AG02', consecutivo: 'PED0102', cliente: 'CL003', fechaDocumento: '2026-08-09', fechaSincronizacion: '2026-08-09' },
	{ tipoDocumento: 'Devolucion', ruta: 'R001', rutero: 'AG01', consecutivo: 'DEV0006', cliente: 'CL002', fechaDocumento: '2026-08-09', fechaSincronizacion: '2026-08-10' }
];

@Component({
	selector: 'app-documentos-no-cargados-page',
	templateUrl: './documentos-no-cargados-page.component.html',
	styleUrls: ['./documentos-no-cargados-page.component.scss']
})
export class DocumentosNoCargadosPageComponent implements OnInit, AfterViewInit {
	constructor(private _formBuilder: FormBuilder) {}

	filtroForm!: FormGroup;
	resultados = new MatTableDataSource<IDocumentoNoCargado>();
	displayedColumns: string[] = ['tipoDocumento', 'ruta', 'rutero', 'consecutivo', 'cliente', 'fechaDocumento', 'fechaSincronizacion'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	ngOnInit(): void {
		this.filtroForm = this._formBuilder.group({ compania: ['COAGRO2'] });
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
