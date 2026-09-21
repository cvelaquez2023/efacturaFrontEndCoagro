import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface IClienteAbandono {
	cliente: string;
	ruta: string;
	ultimaVisita: string;
	diasSinVisita: number;
}

// Reporte solo visual (manual pag. 77): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IClienteAbandono[] = [
	{ cliente: 'CL003', ruta: 'R002', ultimaVisita: '2026-06-15', diasSinVisita: 56 },
	{ cliente: 'CL004', ruta: 'R003', ultimaVisita: '2026-07-01', diasSinVisita: 40 }
];

@Component({
	selector: 'app-clientes-abandono-page',
	templateUrl: './clientes-abandono-page.component.html',
	styleUrls: ['./clientes-abandono-page.component.scss']
})
export class ClientesAbandonoPageComponent implements OnInit, AfterViewInit {
	constructor(private _formBuilder: FormBuilder) {}

	filtroForm!: FormGroup;
	resultados = new MatTableDataSource<IClienteAbandono>();
	displayedColumns: string[] = ['cliente', 'ruta', 'ultimaVisita', 'diasSinVisita'];
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	ngOnInit(): void {
		this.filtroForm = this._formBuilder.group({
			compania: ['COAGRO2', [Validators.required]],
			clientes: [''],
			rutas: [''],
			cantidadDias: [30, [Validators.required, Validators.min(0)]]
		});
		this.resultados.data = MOCK_DATA;
	}

	ngAfterViewInit(): void {
		this.resultados.paginator = this.paginator;
		this.resultados.sort = this.sort;
	}

	generar(): void {
		if (this.filtroForm.invalid) {
			return;
		}
		this.resultados.data = MOCK_DATA;
	}
}
