import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';

import { F1SelectorComponent, IF1Item } from '../../../shared/f1-selector/f1-selector.component';
import { ClienteFrApiService } from '@app/modules/fr/administracion/clientes/service/cliente-fr-api.service';
import { GrupoArticuloApiService } from '@app/modules/fr/administracion/grupos-articulos/service/grupo-articulo-api.service';
import { HandheldApiService } from '@app/modules/fr/administracion/handhelds/service/handheld-api.service';
import { AsignacionRutaMockStoreService } from '../../../asignacion-rutas/service/asignacion-ruta-mock-store.service';
import {
	DIAS_SEMANA,
	DiaSemana,
	EstadoAsignacionCliente,
	IClienteRuta
} from '../../../asignacion-rutas/model/asignacion-ruta-model-interface';
import { ICompaniaConsecutivoRuta, IRutaCabeceraAsignacion } from '../../model/detalle-ruta-model-interface';
import { COMPANIAS_DISPONIBLES, ICompaniaF1Item, NCF_DISPONIBLES } from '../../model/detalle-ruta-mock-data';
import { DetalleRutaMockStoreService } from '../../service/detalle-ruta-mock-store.service';
import { RutaApiService } from '../../service/ruta-api.service';
import { ICreateRutaModel, IResponseRuta } from '../../model/ruta-fr-model-interface';

interface IFilaClienteRuta {
	cliente: string;
	nombre: string;
	dia: DiaSemana | '';
	orden: number;
}

const RESOLUCIONES_DISPONIBLES: IF1Item[] = [
	{ codigo: 'RES-2026-001', nombre: 'Resolución Facturación - Vigente' },
	{ codigo: 'RES-2026-002', nombre: 'Resolución Devolución - Vigente' },
	{ codigo: 'RES-2025-014', nombre: 'Resolución Facturación - Descontinuada' }
];

const AGENTES_DISPONIBLES: IF1Item[] = [
	{ codigo: 'AG01', nombre: 'Vendedor 1' },
	{ codigo: 'AG02', nombre: 'Vendedor 2' },
	{ codigo: 'AG03', nombre: 'Vendedor 3' },
	{ codigo: 'AG04', nombre: 'Vendedor 4' }
];

const BODEGAS_DISPONIBLES: IF1Item[] = [
	{ codigo: 'CAM1', nombre: 'Bodega 1' },
	{ codigo: 'CAM2', nombre: 'Bodega 2' },
	{ codigo: 'BODC', nombre: 'Bodega Central' }
];

const ESTADO_ICONO: Record<EstadoAsignacionCliente, string> = {
	NO_ASIGNADO: 'radio_button_unchecked',
	EN_OTRAS_RUTAS: 'alt_route',
	RUTA_ACTUAL_Y_OTRAS: 'join_inner',
	EN_RUTA_ACTUAL: 'check_circle'
};
const ESTADO_TEXTO: Record<EstadoAsignacionCliente, string> = {
	NO_ASIGNADO: 'No Asignado',
	EN_OTRAS_RUTAS: 'En Otras Rutas',
	RUTA_ACTUAL_Y_OTRAS: 'Ruta Actual & Otras',
	EN_RUTA_ACTUAL: 'En Ruta Actual'
};

// Detalle de una Ruta: reúne Ruta Asignada / Asignación de Agente / Actividad / Consecutivos por
// Compañía / Clientes (manual FRd, secciones RUTAS y ASIGNACIÓN DE RUTAS combinadas a pedido del
// usuario). ACTIVA es el único dato real (se guarda contra /fr/rutaRt); Grupo Artículo y HandHeld
// son F1 reales; los consecutivos, NCF, Resolución, Agente, Camión/Bodega y la asignación
// cliente-día siguen en mock porque no existe backend todavía.
@Component({
	selector: 'app-detalle-ruta',
	templateUrl: './detalle-ruta.component.html',
	styleUrls: ['./detalle-ruta.component.scss']
})
export class DetalleRutaComponent implements OnInit, AfterViewInit {
	dias = DIAS_SEMANA;
	estadoIcono = ESTADO_ICONO;
	estadoTexto = ESTADO_TEXTO;

	cabecera: IRutaCabeceraAsignacion;
	activa: string;

	filas: ICompaniaConsecutivoRuta[] = [];
	filaSeleccionada: ICompaniaConsecutivoRuta | null = null;

	cargandoClientes = true;
	filasClientes = new MatTableDataSource<IFilaClienteRuta>();
	displayedColumnsClientes: string[] = ['cliente', 'nombre', 'asignacion'];

	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	constructor(
		@Inject(MAT_DIALOG_DATA) public ruta: IResponseRuta,
		private _dialogRef: MatDialogRef<DetalleRutaComponent>,
		private _dialog: MatDialog,
		private _snotifyService: SnotifyService,
		private _store: DetalleRutaMockStoreService,
		private _rutaApiService: RutaApiService,
		private _clienteApiService: ClienteFrApiService,
		private _grupoArticuloApiService: GrupoArticuloApiService,
		private _handheldApiService: HandheldApiService,
		private _asignacionStore: AsignacionRutaMockStoreService
	) {
		this.cabecera = this._store.getCabecera(this.ruta.RUTA);
		this.activa = this.ruta.ACTIVA;
		this._cargarConsecutivos();
	}

	ngOnInit(): void {
		this._clienteApiService.getClientes().subscribe({
			next: (response) => {
				if (response.success) {
					this._asignacionStore.inicializarSimulacion(
						response.result.map((c) => c.CLIENTE),
						this.ruta.RUTA
					);
					const guardados = this._asignacionStore.getClientesRuta(this.ruta.RUTA);
					const asignadosPorCodigo = new Map(guardados.map((c) => [c.cliente, c]));
					this.filasClientes.data = response.result.map((c) => {
						const asignado = asignadosPorCodigo.get(c.CLIENTE);
						return {
							cliente: c.CLIENTE,
							nombre: c.NOMBRE,
							dia: asignado?.dia ?? '',
							orden: asignado?.orden ?? 0
						};
					});
				} else {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
				}
				this.cargandoClientes = false;
			},
			error: () => {
				this.cargandoClientes = false;
				this._snotifyService.error('No se pudo cargar el catálogo de clientes', { position: SnotifyPosition.rightTop });
			}
		});
	}

	ngAfterViewInit(): void {
		this.filasClientes.paginator = this.paginator;
		this.filasClientes.sort = this.sort;
		this.filasClientes.filterPredicate = (fila, filtro) => `${fila.cliente} ${fila.nombre}`.toLowerCase().includes(filtro);
	}

	applyFilterClientes(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filasClientes.filter = filterValue.trim().toLowerCase();
	}

	get companiasTexto(): string {
		return this.filas.length ? this.filas.map((f) => f.compania).join(', ') : 'Sin compañías definidas';
	}

	private _cargarConsecutivos(): void {
		this.filas = this._store.getFilas(this.ruta.RUTA);
		this.filaSeleccionada = this.filas[0] ?? null;
	}

	seleccionarFilaConsecutivo(fila: ICompaniaConsecutivoRuta): void {
		this.filaSeleccionada = fila;
	}

	mostrarNcf(fila: ICompaniaConsecutivoRuta): boolean {
		return fila.pais === 'DO';
	}

	mostrarResolucion(fila: ICompaniaConsecutivoRuta): boolean {
		return fila.pais === 'GT';
	}

	nuevaCompania(): void {
		this._dialog
			.open(F1SelectorComponent, {
				width: '40%',
				data: { titulo: 'Seleccionar Compañía', items: COMPANIAS_DISPONIBLES, columnaCodigo: 'Compañía', columnaNombre: 'Nombre' }
			})
			.afterClosed()
			.subscribe((seleccion: ICompaniaF1Item) => {
				if (!seleccion) return;
				if (this.filas.some((f) => f.compania === seleccion.codigo)) {
					this._snotifyService.warning('Esa compañía ya tiene consecutivos definidos en esta ruta', { position: SnotifyPosition.rightTop });
					return;
				}
				const nueva: ICompaniaConsecutivoRuta = {
					compania: seleccion.codigo,
					companiaNombre: seleccion.nombre,
					pais: seleccion.pais,
					devolucion: '',
					pedido: '',
					pedidoConDescuento: '',
					factura: '',
					inventario: '',
					reciboCobro: '',
					notaCredito: '',
					ncfConsumidorFinal: '',
					ncfCreditoFiscal: '',
					resolucionFactura: '',
					resolucionDevolucion: ''
				};
				this.filas = [...this.filas, nueva];
				this.filaSeleccionada = nueva;
			});
	}

	eliminarCompaniaSeleccionada(): void {
		if (!this.filaSeleccionada) return;
		this._snotifyService.confirm('¿Eliminar los consecutivos de esta compañía para la ruta?', {
			position: SnotifyPosition.rightTop,
			buttons: [
				{
					text: 'SI',
					bold: true,
					action: (toast) => {
						this._snotifyService.remove(toast.id);
						this.filas = this.filas.filter((f) => f !== this.filaSeleccionada);
						this.filaSeleccionada = this.filas[0] ?? null;
					}
				},
				{ text: 'CANCELAR' }
			]
		});
	}

	abrirPickerNcf(fila: ICompaniaConsecutivoRuta, campo: 'ncfConsumidorFinal' | 'ncfCreditoFiscal'): void {
		this._dialog
			.open(F1SelectorComponent, {
				width: '40%',
				data: { titulo: 'Seleccionar NCF', items: NCF_DISPONIBLES, columnaCodigo: 'NCF', columnaNombre: 'Descripción' }
			})
			.afterClosed()
			.subscribe((seleccion: IF1Item) => {
				if (seleccion) fila[campo] = seleccion.codigo;
			});
	}

	abrirPickerResolucion(fila: ICompaniaConsecutivoRuta, campo: 'resolucionFactura' | 'resolucionDevolucion'): void {
		this._dialog
			.open(F1SelectorComponent, {
				width: '40%',
				data: { titulo: 'Seleccionar Resolución', items: RESOLUCIONES_DISPONIBLES, columnaCodigo: 'Resolución', columnaNombre: 'Descripción' }
			})
			.afterClosed()
			.subscribe((seleccion: IF1Item) => {
				if (seleccion) fila[campo] = seleccion.codigo;
			});
	}

	estadoAsignacion(fila: IFilaClienteRuta): EstadoAsignacionCliente {
		const enRutaActual = !!fila.dia;
		const enOtras = this._asignacionStore.estaEnOtrasRutas(fila.cliente);
		if (enRutaActual && enOtras) return 'RUTA_ACTUAL_Y_OTRAS';
		if (enRutaActual) return 'EN_RUTA_ACTUAL';
		if (enOtras) return 'EN_OTRAS_RUTAS';
		return 'NO_ASIGNADO';
	}

	chipTexto(fila: IFilaClienteRuta): string {
		const base = this.estadoTexto[this.estadoAsignacion(fila)];
		return fila.dia ? `${base} · ${fila.dia}` : base;
	}

	cambiarDia(fila: IFilaClienteRuta, nuevoDia: DiaSemana | ''): void {
		if (!nuevoDia) {
			fila.dia = '';
			fila.orden = 0;
			return;
		}
		const enElMismoDia = this.filasClientes.data.filter((f) => f.dia === nuevoDia && f !== fila);
		fila.dia = nuevoDia;
		fila.orden = enElMismoDia.length + 1;
	}

	abrirPickerGrupoArticulo(): void {
		this._grupoArticuloApiService.getGruposArticulo().subscribe({
			next: (response) => {
				if (!response.success) {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					return;
				}
				const items: IF1Item[] = response.result.map((g) => ({ codigo: g.GRUPO_ARTICULO, nombre: g.DESCRIPCION }));
				this._abrirF1('Seleccionar Grupo de Artículo', items, (seleccion) => {
					this.cabecera.grupoArticulo = seleccion.codigo;
					this.cabecera.grupoArticuloNombre = seleccion.nombre;
				});
			}
		});
	}

	abrirPickerHandheld(): void {
		this._handheldApiService.getHandhelds().subscribe({
			next: (response) => {
				if (!response.success) {
					this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					return;
				}
				const items: IF1Item[] = response.result.map((h) => ({ codigo: h.HANDHELD, nombre: h.DESCRIPCION }));
				this._abrirF1('Seleccionar HandHeld', items, (seleccion) => {
					this.cabecera.handheld = seleccion.codigo;
					this.cabecera.handheldNombre = seleccion.nombre;
				});
			}
		});
	}

	abrirPickerAgente(): void {
		this._abrirF1('Seleccionar Agente', AGENTES_DISPONIBLES, (seleccion) => {
			this.cabecera.agente = seleccion.codigo;
			this.cabecera.agenteNombre = seleccion.nombre;
		});
	}

	abrirPickerBodega(): void {
		this._abrirF1('Seleccionar Camión / Bodega', BODEGAS_DISPONIBLES, (seleccion) => {
			this.cabecera.bodega = seleccion.codigo;
			this.cabecera.bodegaNombre = seleccion.nombre;
		});
	}

	private _abrirF1(titulo: string, items: IF1Item[], onSeleccionar: (item: IF1Item) => void): void {
		this._dialog
			.open(F1SelectorComponent, { width: '40%', data: { titulo, items } })
			.afterClosed()
			.subscribe((seleccion: IF1Item) => {
				if (seleccion) onSeleccionar(seleccion);
			});
	}

	guardar(): void {
		this._store.guardarFilas(this.ruta.RUTA, this.filas);
		this._store.guardarCabecera(this.ruta.RUTA, this.cabecera);
		const asignados: IClienteRuta[] = this.filasClientes.data
			.filter((f) => f.dia)
			.map((f) => ({ cliente: f.cliente, nombre: f.nombre, dia: f.dia, orden: f.orden }));
		this._asignacionStore.guardarClientesRuta(this.ruta.RUTA, asignados);

		if (this.activa !== this.ruta.ACTIVA) {
			const data: ICreateRutaModel = {
				ruta: this.ruta.RUTA,
				descripcion: this.ruta.DESCRIPCION,
				periodicidad: this.ruta.PERIODICIDAD,
				activa: this.activa,
				grupoTelefono: this.ruta.GRUPO_TELEFONO
			};
			this._rutaApiService.updateRuta(this.ruta.RUTA, data).subscribe({
				next: (response) => {
					if (response.success) {
						this.ruta.ACTIVA = this.activa;
						this._avisarGuardado(true);
					} else {
						this._snotifyService.error(response.errors[0], { position: SnotifyPosition.rightTop });
					}
				}
			});
			return;
		}
		this._avisarGuardado(false);
	}

	private _avisarGuardado(cambioActiva: boolean): void {
		this._snotifyService.info('El detalle se guardó (consecutivos, agente y clientes solo en esta sesión; sin backend aún)', {
			position: SnotifyPosition.rightTop
		});
		if (cambioActiva) this._dialogRef.close(true);
	}
}
