import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface ILiquidacionAgente {
	tipoDocumento: string;
	consecutivo: string;
	cliente: string;
	monto: number;
}

// Reporte solo visual (manual pag. 81): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: ILiquidacionAgente[] = [
	{ tipoDocumento: 'Factura Contado', consecutivo: 'FAC0045', cliente: 'CL001', monto: 145.5 },
	{ tipoDocumento: 'Recibo', consecutivo: 'REC0021', cliente: 'CL002', monto: 90.0 },
	{ tipoDocumento: 'Devolucion', consecutivo: 'DEV0004', cliente: 'CL001', monto: -25.0 }
];

@Component({
	selector: 'app-liquidacion-agentes-page',
	templateUrl: './liquidacion-agentes-page.component.html',
	styleUrls: ['./liquidacion-agentes-page.component.scss']
})
export class LiquidacionAgentesPageComponent implements OnInit, AfterViewInit {
	constructor(private _formBuilder: FormBuilder) {}

	filtroForm!: FormGroup;
	resultados = new MatTableDataSource<ILiquidacionAgente>();
	displayedColumns: string[] = ['tipoDocumento', 'consecutivo', 'cliente', 'monto'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	ngOnInit(): void {
		this.filtroForm = this._formBuilder.group({
			compania: [''],
			agente: ['', [Validators.required]],
			ruta: ['', [Validators.required]],
			fechaDesde: ['', [Validators.required]],
			fechaHasta: ['', [Validators.required]]
		});
		this.resultados.data = MOCK_DATA;
	}

	ngAfterViewInit(): void {
		this.resultados.paginator = this.paginator;
		this.resultados.sort = this.sort;
	}

	get totalLiquidacion(): number {
		return this.resultados.data.reduce((sum, item) => sum + item.monto, 0);
	}

	generar(): void {
		this.resultados.data = MOCK_DATA;
	}
}
