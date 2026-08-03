import { MovInventarioApiService } from './../../service/movInventario-api.service';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SnotifyPosition } from 'ng-snotify';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConsultaPaqueteInvApiModel, ICreateMovInventario } from './../../model/paqueteInv-api-model-interface';
import { AddPaqueteUsuarioPageComponent } from './../add-paqueteUsuario-page/add-paqueteUsuario-page.component';
import { AddPaqueteciPageComponent } from './../add-paqueteci-page/add-paqueteci-page.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IConsultaDocumnetoInvEnca } from './../../model/documentoInvEnca-api-model-interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { PaqueteciApiService } from './../../service/paqueteci-api.service';
import { SnotifyService } from 'ng-snotify';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { isNull } from '@angular/compiler/src/output/output_ast';

@Component({
	selector: 'app-paqueteci-page',
	templateUrl: './paqueteci-page.component.html',
	styleUrls: ['./paqueteci-page.component.scss']
})
export class PaqueteciPageComponent implements OnInit, AfterViewInit {
	constructor(
		private _snotifyService: SnotifyService,
		private _paqueteciApiService: PaqueteciApiService,
		private _movInventarioApiService: MovInventarioApiService,
		private _dialog: MatDialog,
		private _formBuilder: FormBuilder
	) {
		this._loadPaqueteUsuario();
	}
	selected = '';
	selectedValue: number | undefined;
	listDoc = new MatTableDataSource<IConsultaDocumnetoInvEnca>();
	displayedColumns: string[] = ['Consecutivo', 'Documento', 'FechaDoc', 'Referencia', 'Usuario', 'Estatus', 'actions'];
	@ViewChild(MatSort)
	sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;
	searchKey!: 'carlos';
	formPaqueteUsuario!: FormGroup;
	paquetes: IConsultaPaqueteInvApiModel[] = [];
	paqueteId!: number;
	ngAfterViewInit(): void {
		this.listDoc.paginator = this.paginator;
		this.listDoc.sort = this.sort;
	}
	ngOnInit(): void {
		this._loadPaquete(1, 10000);
	}
	private _loadDocumento(idPaquete: number): void {
		this._paqueteciApiService.getDocumnetoInvEnc().subscribe({
			next: (response) => {
				const documentoinvEncNew = response.result;
				const _doccumentoInvEncNew = documentoinvEncNew.filter((f) => f.paqueteInventarioId == idPaquete);
				this.listDoc.data = _doccumentoInvEncNew;
			},
			error: () => {
				console.log('error');
			}
		});
	}
	private _loadPaqueteUsuario(): void {
		this.formPaqueteUsuario = this._formBuilder.group({
			codigoPaqueteUsuario: [null, Validators.required]
		});
	}
	selectPaquete(id: number): void {
		this.paqueteId = id;
		this._loadDocumento(this.paqueteId);
	}
	private _loadPaquete(page: number, rows: number): void {
		this._paqueteciApiService.getPaqueteInv(page, rows).subscribe({
			next: (response) => {
				this.paquetes = response.result;
			},
			error: () => {
				console.log('error');
			}
		});
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickEdit(element: any): void {
		console.log('editi');
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	clickAplicar(element: IConsultaDocumnetoInvEnca): void {
		/* 1) Validadcos si esta aprovado el paquet
		2) Consultamos el detalle de documento
		3) Armamos el documento para enviarlo a tabla de transacciones de inventarios */

		if (element.aprobado) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const c: any = null; // Ok
			/* //Consultamos el detalle para poderlo recorrelo */
			const sendEnca: ICreateMovInventario = {
				consecutivoId: element.consecutivoId,
				usuario: element.usuario,
				fechaHora: element.fechaDocumento,
				moduloOrigen: 'CI',
				referencia: element.referencia,
				asiento: c,
				usuarioAprob: element.usuarioApro,
				fechaHoraAprob: element.fechaHoraAprob,
				paqueteInventario: element.paqueteInventarioId,
				/* leer la tabla detalle para el recorrido y llenar  */
				detalle: [
					{
						movInventarioEncId: 1,
						consecutivo: 1,
						fechaHoraTransac: '2022-08-08',
						docTributarioId: c,
						ajusteConfigId: 9,
						articuloId: 59,
						bodegaDestinoId: c,
						bodegaId: 22,
						locDestinoId: c,
						localizacionId: 3,
						loteId: 10,
						tipo: 'O',
						subtipo: 'D',
						subsubtipo: 'L',
						naturaleza: 'S',
						cantidad: 50,
						costoTotLoc: 10,
						costoTotDol: 10,
						precioTotalLocal: 0,
						precioTotalDolar: 0,
						contabilizada: false,
						fecha: '2022-08-08',
						centroCuentaId: c,
						unidadDistribucionId: c,
						asientoCardex: c,
						docFiscal: c,
						tipoOperacionId: c,
						tipoPagoId: 1
					}
				]
			};
			console.log(sendEnca);
			this._movInventarioApiService.create(sendEnca).subscribe({
				next: (response) => {
					if (response && response.success) {
						this._snotifyService.info('El registro se guardo sin problema');
					}
				},
				error: (e) => {
					console.log(e);
				}
			});
		} else {
			this._snotifyService.error('El Paquete Tiene que estar Aprobado', { position: SnotifyPosition.rightTop });
		}
	}

	clickDelete(id: number): void {
		console.log('delete');
	}
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	openDialog(element: any): void {
		this._dialog
			.open(AddPaqueteciPageComponent, {
				width: '60%',
				autoFocus: false,
				maxHeight: '90vh',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				data: element
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadDocumento(this.paqueteId);
				}
			});
	}
	openDialog2(): void {
		this._dialog
			.open(AddPaqueteUsuarioPageComponent, {
				//width: '80%'
				autoFocus: false,
				maxHeight: '90vh'
			})
			.afterClosed()
			.subscribe((val) => {
				if (val === 'save') {
					this._loadPaquete(1, 10000);
				}
			});
	}
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.listDoc.filter = filterValue.trim().toLowerCase();
	}
}
