/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IResponseDtes } from '@app/modules/ci/articulo/model/articulo-api-model-interface';
import { EnvioEmailComponent } from '@app/modules/dtes/cliente/pages/envio-email/envio-email.component';
import { ListaObservacionesComponent } from '@app/modules/dtes/cliente/pages/lista-observaciones/lista-observaciones.component';
import { ClienteDteApiService } from '@app/modules/dtes/cliente/service/cliente-dte-api.service';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { AddSujetoExcluidoComponent } from '../add-sujeto-excluido/add-sujeto-excluido.component';
import { IResponseDTE14 } from '../../model/sujetoExcluido_DTE_interface';
import { SujetoexcluidoProveedorService } from '../../services/sujetoexcluido-proveedor.service';
import { AddSujetoExcluidoCHComponent } from '../add-sujeto-excluido-ch/add-sujeto-excluido-ch.component';
interface Opcion {
	value: string;
}
@Component({
	selector: 'app-listar-sujeto-excluido',
	templateUrl: './listar-sujeto-excluido.component.html',
	styleUrls: ['./listar-sujeto-excluido.component.scss']
})
export class ListarSujetoExcluidoComponent implements OnInit, AfterViewInit {
	selectedCar!: string;
	selectedAno!: string;
	mes = new Date().getMonth() + 1;
	years: Opcion[] = [];
	now: Date = new Date();
	actualYear: number = this.now.getFullYear();
	yearsSelected: string[] = [
		(this.actualYear - 4).toString(),
		(this.actualYear - 3).toString(),
		(this.actualYear - 2).toString(),
		(this.actualYear - 1).toString(),
		this.actualYear.toString()
	];
	formGroup!: FormGroup;
	constructor(
		private _snotifyService: SnotifyService,
		private _dteApiService: ClienteDteApiService,
		private _dialog: MatDialog,
		private _formBuilder: FormBuilder,
		private _sujetoExluidoApiService: SujetoexcluidoProveedorService
	) {
		this.selectedCar = this.mes.toString();
		this.selectedAno = this.actualYear.toString();
	}
	listaDocumentos = new MatTableDataSource<IResponseDtes>();
	displayedColumns: string[] = [
		'fechaEmision',
		'tipoDte',
		'numeroControl',
		'modulo',
		'selloRecibido',
		'estado',
		'nombreEmisor',
		'documentoEmisor',
		'montoTotal',
		'actions'
	];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'h2c';

	ngOnInit(): void {
		this._loadFormGroup();

		this.getYears();
	}
	getYears() {
		let year = new Date().getFullYear();
		let yearant = year - 5;
		for (let i = yearant; i <= year; i++) {
			this.years.push({ value: i.toString() });
		}
	}
	private _loadDoc(ano: string, mes: string): void {
		this._dteApiService.getProveedor(ano, mes, '14').subscribe({
			next: (response) => {
				this.listaDocumentos.data = response.result;
			},
			error: (error) => {
				console.log('er', error);
			}
		});
	}
	private _loadFormGroup(): void {
		this.formGroup = this._formBuilder.group({
			ano: [],
			mes: []
		});
		this.formGroup.controls['mes'].setValue(this.mes);
		this.formGroup.controls['ano'].setValue(this.actualYear);
		this._loadDoc(this.anoField.value as string, this.mesField.value as string);
	}
	ngAfterViewInit(): void {
		this.listaDocumentos.paginator = this.paginator;
		this.listaDocumentos.sort = this.sort;
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listaDocumentos.filter = filterValue.trim().toLowerCase();
	}
	openDialog(): void {
		this._dialog
			.open(AddSujetoExcluidoComponent, {
				width: '40%',
				autoFocus: false
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadDoc(this.anoField.value as string, this.mesField.value as string);
				}
			});
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	clickImprimir(element: any): void {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		this._dteApiService.getDteDescargar(element.Dte).subscribe((response) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			let file = element.Dte + '.pdf';
			let fileNamae = response.headers.get('content-disposition')?.split(';')[1].split('=')[1];
			let bolb: Blob = response.body as Blob;
			let a = document.createElement('a');
			a.download = file;
			a.href = window.URL.createObjectURL(bolb);
			a.click();
		});
	}
	clickCB(element: any): void {
		this._dialog
			.open(EnvioEmailComponent, {
				width: '30%',
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'update') {
					this._loadDoc(this.anoField.value as string, this.mesField.value as string);
				}
			});
	}
	clickEdit(element: any): void {
		this._dialog
			.open(ListaObservacionesComponent, {
				width: '30%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'update') {
					this._loadDoc(this.anoField.value as string, this.mesField.value as string);
				}
			});
	}
	clickCH(element: any): void {
		this._dialog
			.open(AddSujetoExcluidoCHComponent, {
				width: '50%',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'update') {
					this._loadDoc(this.anoField.value as string, this.mesField.value as string);
				}
			});
	}
	clickCP(element: any): void {
		const data: IResponseDTE14 = {
			tipoDocumento: '13',
			numDocumento: 'ND',
			nombre: 'ND',
			direccion: {
				departamento: 'ND',
				municipio: 'ND',
				complemento: 'ND'
			},
			telefono: 'ND',
			correo: 'ND',
			aplicacion: {
				descripcion: 'ND',
				monto: 0.0,
				renta: 0.0,
				total: 0.0,
				fecha: element.fecha_Emision,
				dte: element.Dte
			},
			hacienda: 'S',
			origen: 'CP'
		};
		this.envioMH(data);
	}
	private envioMH(data: IResponseDTE14): void {
		this._sujetoExluidoApiService.postEnvioDTE(data).subscribe({
			next: (response) => {
				if (response.success === true) {
					this._snotifyService.info('Se Envio sin problema');
				} else {
					this._snotifyService.error('El Envio Hacienda dio un Problema');
				}
			}
		});
	}
	selectMes(mes: string): void {
		this._loadDoc(this.anoField.value as string, mes);
	}
	selectAno(ano: string): void {
		this._loadDoc(ano, this.mesField.value as string);
	}
	get anoField(): AbstractControl {
		return this.formGroup.get('ano')!;
	}
	get mesField(): AbstractControl {
		return this.formGroup.get('mes')!;
	}
}
