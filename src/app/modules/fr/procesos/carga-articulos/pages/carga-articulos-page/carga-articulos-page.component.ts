import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SnotifyPosition, SnotifyService } from 'ng-snotify';
import { EMPTY, Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, expand, last, map, switchMap } from 'rxjs/operators';
import { ArticuloFrApiService } from '@app/modules/fr/administracion/articulos/service/articulo-fr-api.service';
import { IResponseArticuloFr } from '@app/modules/fr/administracion/articulos/model/articulo-fr-model-interface';
import { BodegaFrApiService } from '@app/modules/fr/administracion/bodegas/service/bodega-fr-api.service';
import { IResponseBodegaFr } from '@app/modules/fr/administracion/bodegas/model/bodega-fr-model-interface';
import { GrupoArticuloApiService } from '@app/modules/fr/administracion/grupos-articulos/service/grupo-articulo-api.service';
import { IResponseGrupoArticulo } from '@app/modules/fr/administracion/grupos-articulos/model/grupo-articulo-fr-model-interface';
import { IResponse } from '@app/shared/api-models-base-interface';
import { ArticuloErpApiService } from '../../service/articulo-erp-api.service';
import { IResponseArticuloErp } from '../../model/articulo-erp-fr-model-interface';

interface ISeleccionArticulo {
	ARTICULO: string;
	DESCRIPCION: string;
}

@Component({
	selector: 'app-carga-articulos-page',
	templateUrl: './carga-articulos-page.component.html',
	styleUrls: ['./carga-articulos-page.component.scss']
})
export class CargaArticulosPageComponent implements OnInit, OnDestroy {
	constructor(
		private _articuloErpApiService: ArticuloErpApiService,
		private _articuloFrApiService: ArticuloFrApiService,
		private _bodegaFrApiService: BodegaFrApiService,
		private _grupoArticuloApiService: GrupoArticuloApiService,
		private _snotifyService: SnotifyService
	) {}

	articulosErp: IResponseArticuloErp[] = [];
	displayedColumns: string[] = ['seleccionado', 'codigo', 'descripcion'];

	bodegas: IResponseBodegaFr[] = [];
	bodegaSeleccionada = '';

	grupos: IResponseGrupoArticulo[] = [];
	grupoSeleccionado = '';

	q = '';
	page = 1;
	limit = 20;
	total = 0;

	cargando = false;
	procesando = false;

	selectedArticulos = new Map<string, ISeleccionArticulo>();

	/** Codigos de articuloRt ya cargados: se usan para decidir si se crea o actualiza el articulo. */
	private _articulosCargados = new Set<string>();

	/** Grupos de articulo a los que ya pertenece cada articulo (ARTICULO -> set de GRUPO_ARTICULO). */
	private _gruposPorArticulo = new Map<string, Set<string>>();

	private _busqueda$ = new Subject<string>();

	ngOnInit(): void {
		this._busqueda$
			.pipe(
				debounceTime(300),
				distinctUntilChanged()
			)
			.subscribe((q) => {
				this.q = q;
				this.page = 1;
				this._cargarPagina();
			});
		this._cargarArticulosCargados().subscribe(() => this._cargarPagina());
		this._bodegaFrApiService.getBodegas().subscribe({
			next: (response) => {
				if (response.success) {
					this.bodegas = response.result;
				}
			}
		});
		this._grupoArticuloApiService.getGruposArticulo().subscribe({
			next: (response) => {
				if (response.success) {
					this.grupos = response.result;
				}
			}
		});
		this._grupoArticuloApiService.getAllAsociaciones().subscribe((asociaciones) => {
			asociaciones.forEach((a) => this._addGrupoArticulo(a.ARTICULO, a.GRUPO_ARTICULO));
		});
	}

	private _addGrupoArticulo(articulo: string, grupoArticulo: string): void {
		const grupos = this._gruposPorArticulo.get(articulo) ?? new Set<string>();
		grupos.add(grupoArticulo);
		this._gruposPorArticulo.set(articulo, grupos);
	}

	/** Recorre todas las paginas de articuloRt (limite maximo del backend: 100 por pagina). */
	private _cargarArticulosCargados(): Observable<void> {
		return this._articuloFrApiService.getArticulos(1, 100).pipe(
			expand((response) =>
				response.success && response.pagination.page < response.pagination.totalPages
					? this._articuloFrApiService.getArticulos(response.pagination.page + 1, 100)
					: EMPTY
			),
			map((response) => {
				if (response.success) {
					response.result.forEach((a) => this._articulosCargados.add(a.ARTICULO));
				}
			}),
			last()
		);
	}

	ngOnDestroy(): void {
		this._busqueda$.complete();
	}

	onBuscar(event: Event): void {
		const valor = (event.target as HTMLInputElement).value;
		this._busqueda$.next(valor.trim());
	}

	onPageChange(event: PageEvent): void {
		this.page = event.pageIndex + 1;
		this.limit = event.pageSize;
		this._cargarPagina();
	}

	private _cargarPagina(): void {
		this.cargando = true;
		this._articuloErpApiService.getArticulosErp(this.q, this.page, this.limit).subscribe({
			next: (response) => {
				this.cargando = false;
				if (response.success) {
					this.articulosErp = response.result;
					this.total = response.pagination ? response.pagination.total : response.result.length;
				} else {
					this._snotifyService.error(response.errors?.[0] ?? 'Error al consultar los articulos del ERP', {
						position: SnotifyPosition.rightTop
					});
				}
			},
			error: () => {
				this.cargando = false;
				this._snotifyService.error('No fue posible consultar los articulos del ERP', { position: SnotifyPosition.rightTop });
			}
		});
	}

	isSelected(articulo: string): boolean {
		return this.selectedArticulos.has(articulo);
	}

	toggleArticulo(element: IResponseArticuloErp, checked: boolean): void {
		if (checked) {
			this.selectedArticulos.set(element.ARTICULO, { ARTICULO: element.ARTICULO, DESCRIPCION: element.DESCRIPCION });
		} else {
			this.selectedArticulos.delete(element.ARTICULO);
		}
	}

	cargarSeleccionados(): void {
		if (this.selectedArticulos.size === 0 || this.procesando) {
			return;
		}
		const seleccionados = Array.from(this.selectedArticulos.values());
		this.procesando = true;
		let gruposFallidos = 0;
		const articulosYaEnGrupo: string[] = [];

		const peticiones = seleccionados.map((articulo) => {
			const datos = {
				articulo: articulo.ARTICULO,
				descripcion: articulo.DESCRIPCION,
				...(this.bodegaSeleccionada ? { bodega: this.bodegaSeleccionada } : {})
			};
			const yaCargado = this._articulosCargados.has(articulo.ARTICULO);
			const guardarArticulo$: Observable<IResponse<IResponseArticuloFr>> = yaCargado
				? this._articuloFrApiService
						.updateArticulo(articulo.ARTICULO, datos)
						.pipe(
							map(
								(response) =>
									({ success: response.success, errors: response.errors, result: articulo as unknown as IResponseArticuloFr } as IResponse<
										IResponseArticuloFr
									>)
							)
						)
				: this._articuloFrApiService.createArticulo(datos);

			return guardarArticulo$.pipe(
				switchMap((response) => {
					if (!response.success || !this.grupoSeleccionado) {
						return of(response);
					}
					if (this._gruposPorArticulo.get(articulo.ARTICULO)?.has(this.grupoSeleccionado)) {
						articulosYaEnGrupo.push(articulo.ARTICULO);
						return of(response);
					}
					return this._grupoArticuloApiService
						.asociarArticulo({ grupoArticulo: this.grupoSeleccionado, articulo: articulo.ARTICULO })
						.pipe(
							map((asocResponse) => {
								if (asocResponse.success) {
									this._addGrupoArticulo(articulo.ARTICULO, this.grupoSeleccionado);
								} else {
									gruposFallidos++;
								}
								return response;
							}),
							catchError(() => {
								gruposFallidos++;
								return of(response);
							})
						);
				}),
				catchError(() =>
					of<IResponse<IResponseArticuloFr>>({ success: false, errors: ['Error de conexión'], result: null as unknown as IResponseArticuloFr })
				)
			);
		});

		forkJoin(peticiones).subscribe((respuestas) => {
			this.procesando = false;
			let exitosos = 0;
			let primerError = '';

			respuestas.forEach((respuesta, index) => {
				if (respuesta.success) {
					exitosos++;
					this._articulosCargados.add(seleccionados[index].ARTICULO);
					this.selectedArticulos.delete(seleccionados[index].ARTICULO);
				} else if (!primerError) {
					primerError = respuesta.errors?.[0] ?? '';
				}
			});
			const fallidos = respuestas.length - exitosos;

			if (exitosos) {
				this._snotifyService.info(`${exitosos} articulo(s) cargado(s) correctamente`, { position: SnotifyPosition.rightTop });
			}
			if (fallidos) {
				this._snotifyService.warning(`${fallidos} articulo(s) no se pudieron cargar: ${primerError}`, {
					position: SnotifyPosition.rightTop
				});
			}
			if (gruposFallidos) {
				this._snotifyService.warning(`${gruposFallidos} articulo(s) no se pudieron vincular al grupo de artículo seleccionado`, {
					position: SnotifyPosition.rightTop
				});
			}
			if (articulosYaEnGrupo.length) {
				const mensaje =
					articulosYaEnGrupo.length === 1
						? `El artículo ${articulosYaEnGrupo[0]} ya pertenece al grupo ${this.grupoSeleccionado}`
						: `Los artículos ${articulosYaEnGrupo.join(', ')} ya pertenecen al grupo ${this.grupoSeleccionado}`;
				this._snotifyService.warning(mensaje, { position: SnotifyPosition.rightTop });
			}

			this._cargarPagina();
		});
	}
}
