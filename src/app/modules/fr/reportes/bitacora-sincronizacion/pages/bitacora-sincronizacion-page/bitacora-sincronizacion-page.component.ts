import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface IBitacoraSincronizacion {
	rutero: string;
	horaInicio: string;
	horaFin: string;
	estado: 'Exitosa' | 'Con errores' | 'Fallida';
}

// Reporte solo visual (manual pag. 76): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IBitacoraSincronizacion[] = [
	{ rutero: 'AG01', horaInicio: '2026-08-10T06:15:00', horaFin: '2026-08-10T06:17:00', estado: 'Exitosa' },
	{ rutero: 'AG02', horaInicio: '2026-08-10T06:20:00', horaFin: '2026-08-10T06:24:00', estado: 'Exitosa' },
	{ rutero: 'AG03', horaInicio: '2026-08-10T06:30:00', horaFin: '2026-08-10T06:31:00', estado: 'Con errores' }
];

@Component({
	selector: 'app-bitacora-sincronizacion-page',
	templateUrl: './bitacora-sincronizacion-page.component.html',
	styleUrls: ['./bitacora-sincronizacion-page.component.scss']
})
export class BitacoraSincronizacionPageComponent implements OnInit, AfterViewInit {
	constructor(private _formBuilder: FormBuilder) {}

	filtroForm!: FormGroup;
	resultados = new MatTableDataSource<IBitacoraSincronizacion>();
	displayedColumns: string[] = ['rutero', 'horaInicio', 'horaFin', 'estado'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	ngOnInit(): void {
		this.filtroForm = this._formBuilder.group({ compania: ['COAGRO2'], fecha: [new Date().toISOString().slice(0, 10)] });
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
