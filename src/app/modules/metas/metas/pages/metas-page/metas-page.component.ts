import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, from, Observable, of } from "rxjs";
import { catchError, finalize, map, mergeMap, toArray } from "rxjs/operators";
import { exportarCsv } from "@app/modules/fr/reportes/shared/reporte-utils";
import { MetasApiService, mensajeErrorHttp } from "../../../metas-shared/metas-api.service";
import {
  aNumero,
  CATALOGO_LIDERES,
  CATALOGO_LINEAS_NEGOCIO,
  CATALOGO_PROVEEDORES,
  ICatalogosMetas,
  IFiltroMetas,
  IMetaVenta,
  IVendedor,
  MESES,
  nombreMes,
  primerError,
  conTildes,
} from "../../../metas-shared/metas.model";
import { BuscadorErpComponent } from "@app/modules/fr/administracion/condiciones-comerciales-shared/buscador-erp/buscador-erp.component";
import { ICodigoNombre } from "@app/modules/fr/administracion/condiciones-comerciales-shared/condiciones-comerciales.model";
import { IOpcionBuscable } from "../../../metas-shared/select-buscable/select-buscable.component";
import { CargaPresupuestoComponent } from "../../components/carga-presupuesto/carga-presupuesto.component";
import { ConsultaMetasComponent, IConsultaMetasData } from "../../components/consulta-metas/consulta-metas.component";
import { MetaDialogComponent } from "../../components/meta-dialog/meta-dialog.component";

/**
 * Metas (FR → Administración): metas de venta en unidades por año/mes/vendedor/artículo
 * (CINCOH.MetaVentaProducto), el catálogo de Líneas de Negocio y la carga masiva (presupuesto).
 */
@Component({
  selector: "app-metas-page",
  templateUrl: "./metas-page.component.html",
  styleUrls: ["./metas-page.component.scss"],
})
export class MetasPageComponent implements OnInit {
  readonly meses = MESES;
  readonly nombreMes = nombreMes;
  readonly num = aNumero;

  readonly columnas = [
    "sel",
    "mes",
    "linea",
    "lider",
    "vendedor",
    "articulo",
    "proveedor",
    "incentivo",
    "meta",
    "minimo",
    "ventaUnidades",
    "ventaValor",
    "avance",
  ];

  filtros: FormGroup;
  catalogos: ICatalogosMetas = { lineas: [], lideres: [], proveedores: [], vendedores: [] };
  filas: IMetaVenta[] = [];
  total = 0;
  page = 1;
  limit = 20;
  cargando = false;
  tab = 0;

  /** Metas marcadas para eliminar (IdMeta). Se conservan al cambiar de página; se limpian al buscar. */
  seleccion = new Set<number>();
  /** «Actualizar ventas» en curso. */
  actualizandoVentas = false;
  seleccionandoTodas = false;
  eliminando = false;
  eliminadas = 0;
  totalEliminar = 0;
  @ViewChild(CargaPresupuestoComponent) private _carga?: CargaPresupuestoComponent;
  @ViewChild("buscadorArticulo") private _buscadorArticulo?: BuscadorErpComponent;

  /** Opciones de los filtros con búsqueda (se arman una vez al cargar los catálogos). */
  opcionesLineas: IOpcionBuscable[] = [];
  opcionesLideres: IOpcionBuscable[] = [];
  opcionesProveedores: IOpcionBuscable[] = [];
  opcionesVendedores: IOpcionBuscable[] = [];

  constructor(
    fb: FormBuilder,
    private _api: MetasApiService,
    private _dialog: MatDialog,
    private _snotify: SnotifyService
  ) {
    this.filtros = fb.group({
      anio: [new Date().getFullYear()],
      mes: [null],
      idLineaNegocio: [null],
      idLider: [null],
      idProveedor: [null],
      vendedor: [null],
      articulo: [""],
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.buscar();
  }

  /** Recarga líneas, líderes, proveedores y vendedores (todos, también inactivos, para filtrar). */
  cargarCatalogos(): void {
    const seguro = <T>(obs: Observable<T[]>, nombre: string) =>
      obs.pipe(
        catchError((e) => {
          this._error(`${nombre}: ${mensajeErrorHttp(e)}`);
          return of([] as T[]);
        })
      );
    forkJoin({
      lineas: seguro(this._api.todosCatalogo(CATALOGO_LINEAS_NEGOCIO), "Líneas de negocio"),
      lideres: seguro(this._api.todosCatalogo(CATALOGO_LIDERES), "Líderes"),
      proveedores: seguro(this._api.todosCatalogo(CATALOGO_PROVEEDORES), "Proveedores"),
      vendedores: seguro(this._api.todosVendedores(), "Vendedores"),
    }).subscribe((c) => {
      this.catalogos = c;
      const opcion = (codigo: string, nombre: string) => (nombre && nombre !== codigo ? `${codigo} · ${nombre}` : codigo);
      this.opcionesLineas = c.lineas.map((x) => ({ valor: x.id, texto: opcion(x.codigo, x.nombre) }));
      this.opcionesLideres = c.lideres.map((x) => ({ valor: x.id, texto: opcion(x.codigo, x.nombre) }));
      this.opcionesProveedores = c.proveedores.map((x) => ({ valor: x.id, texto: opcion(x.codigo, x.nombre) }));
      this.opcionesVendedores = c.vendedores.map((x) => ({ valor: x.codigo, texto: opcion(x.codigo, x.nombre) }));
    });
  }

  /** Botón "Subir Excel": lee el/los archivos y muestra la vista previa en la pestaña Carga de Presupuesto. */
  subirExcel(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    input.value = "";
    if (!archivos.length || !this._carga) return;
    this.tab = 1;
    this._carga.procesarArchivos(archivos);
  }

  cambiarTab(indice: number): void {
    this.tab = indice;
    if (indice === 0) this.buscar();
  }

  buscar(): void {
    this.page = 1;
    this.seleccion.clear();
    this.cargar();
  }

  // ------------------------------------------------------------------ selección múltiple

  estaSeleccionada(f: IMetaVenta): boolean {
    return this.seleccion.has(f.IdMeta);
  }

  alternar(f: IMetaVenta): void {
    if (this.seleccion.has(f.IdMeta)) this.seleccion.delete(f.IdMeta);
    else this.seleccion.add(f.IdMeta);
  }

  /** Todas las filas de ESTA página están marcadas. */
  get paginaCompleta(): boolean {
    return this.filas.length > 0 && this.filas.every((f) => this.seleccion.has(f.IdMeta));
  }

  get paginaParcial(): boolean {
    return !this.paginaCompleta && this.filas.some((f) => this.seleccion.has(f.IdMeta));
  }

  /** Casilla del encabezado: marca o desmarca las filas de la página visible. */
  alternarPagina(): void {
    const marcar = !this.paginaCompleta;
    this.filas.forEach((f) => (marcar ? this.seleccion.add(f.IdMeta) : this.seleccion.delete(f.IdMeta)));
  }

  /** Marca TODAS las metas que cumplen los filtros (todas las páginas). */
  seleccionarTodas(): void {
    this.seleccionandoTodas = true;
    this._api
      .todasLasMetas(this._filtro())
      .pipe(finalize(() => (this.seleccionandoTodas = false)))
      .subscribe({
        next: (todas) => {
          todas.forEach((m) => this.seleccion.add(m.IdMeta));
          this._snotify.info(`${this.seleccion.size} meta(s) seleccionadas`, { position: SnotifyPosition.rightTop });
        },
        error: (e) => this._error(mensajeErrorHttp(e)),
      });
  }

  quitarSeleccion(): void {
    this.seleccion.clear();
  }

  /** Elimina las metas marcadas (de 4 en 4) y muestra el avance y el resultado. */
  eliminarSeleccionadas(): void {
    const ids = [...this.seleccion];
    if (!ids.length || this.eliminando) return;
    this._snotify.confirm(`¿Eliminar ${ids.length} meta(s) seleccionada(s)? Esta acción no se puede deshacer.`, {
      position: SnotifyPosition.rightTop,
      timeout: 0,
      buttons: [
        {
          text: "SI, ELIMINAR",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this.eliminando = true;
            this.eliminadas = 0;
            this.totalEliminar = ids.length;
            const fallidas: string[] = [];
            from(ids)
              .pipe(
                mergeMap(
                  (id) =>
                    this._api.eliminarMeta(id).pipe(
                      map((r) => {
                        if (r.success) {
                          this.seleccion.delete(id);
                          this.eliminadas++;
                        } else {
                          fallidas.push(primerError(r.errors, "No se pudo eliminar"));
                        }
                      }),
                      catchError((e: unknown) => {
                        fallidas.push(mensajeErrorHttp(e));
                        return of(undefined);
                      })
                    ),
                  4
                ),
                toArray(),
                finalize(() => {
                  this.eliminando = false;
                  this.cargar();
                })
              )
              .subscribe(() => {
                if (fallidas.length) {
                  this._error(
                    `Se eliminaron ${this.eliminadas} de ${ids.length}. No se pudieron eliminar ${fallidas.length}: ${[...new Set(fallidas)].join(" · ")}`
                  );
                } else {
                  this._snotify.success(`Se eliminaron ${this.eliminadas} meta(s)`, { position: SnotifyPosition.rightTop });
                }
              });
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }

  limpiar(): void {
    this.filtros.reset({
      anio: new Date().getFullYear(),
      mes: null,
      idLineaNegocio: null,
      idLider: null,
      idProveedor: null,
      vendedor: null,
      articulo: "",
    });
    this._buscadorArticulo?.limpiar(false);
    this.buscar();
  }

  /** Filtro de artículo: se elige del buscador (código o nombre) y se filtra por su código. */
  filtrarArticulo(item: ICodigoNombre | null): void {
    this.filtros.patchValue({ articulo: item?.codigo ?? "" });
    this.buscar();
  }

  /** % de avance = vendido / meta × 100; null ("-") si la meta es 0 o aún no hay venta. */
  avance(f: IMetaVenta): number | null {
    const meta = aNumero(f.Meta_Unidades);
    const venta = aNumero(f.Venta_Unidades);
    return !meta || venta === null ? null : venta / meta;
  }

  /**
   * «Actualizar ventas»: recalcula lo vendido de las metas desde las facturas del ERP (POST
   * /actualizarVentas) con el año y mes del filtro. Sin año pide confirmación (todos los periodos).
   */
  actualizarVentas(): void {
    if (this.actualizandoVentas) return;
    const f = this.filtros.value;
    const anio = aNumero(f.anio);
    const mes = anio ? aNumero(f.mes) : null;
    if (!anio) {
      this._snotify.confirm("Esto recalcula las ventas de TODOS los periodos con metas y puede tardar. ¿Continuar?", {
        position: SnotifyPosition.rightTop,
        timeout: 0,
        buttons: [
          {
            text: "SI, CONTINUAR",
            bold: true,
            action: (toast) => {
              this._snotify.remove(toast.id);
              this._actualizarVentas(null, null);
            },
          },
          { text: "CANCELAR" },
        ],
      });
      return;
    }
    this._actualizarVentas(anio, mes);
  }

  private _actualizarVentas(anio: number | null, mes: number | null): void {
    this.actualizandoVentas = true;
    this._api
      .actualizarVentas(anio, mes)
      .pipe(finalize(() => (this.actualizandoVentas = false)))
      .subscribe({
        next: (r) => {
          if (!r.success) {
            this._error(primerError(r.errors, "No se pudieron actualizar las ventas"));
            return;
          }
          const texto =
            r.mensaje ?? `Se actualizaron las ventas de ${r.result?.metasActualizadas ?? 0} metas.`;
          const tiempo = r.result?.segundos != null ? ` (${r.result.segundos} s)` : "";
          this._snotify.success(conTildes(texto) + tiempo, { position: SnotifyPosition.rightTop, timeout: 6000 });
          this.cargar();
        },
        error: (e) => this._error(mensajeErrorHttp(e)),
      });
  }

  descargarPlantilla(): void {
    this._carga?.descargarPlantilla();
  }

  /** «Consulta»: periodos ya cargados (y borrar un periodo), códigos válidos y reglas de la carga. */
  abrirConsulta(): void {
    const f = this.filtros.value;
    this._dialog
      .open<ConsultaMetasComponent, IConsultaMetasData, boolean>(ConsultaMetasComponent, {
        width: "980px",
        maxWidth: "96vw",
        maxHeight: "92vh",
        data: { anio: f.anio, mes: f.mes },
      })
      .afterClosed()
      .subscribe((huboCambios) => {
        if (huboCambios) this.cargar();
      });
  }

  /** Después de guardar una carga: refrescar metas y catálogos (pudo crear proveedores). */
  despuesDeCargar(): void {
    this.cargarCatalogos();
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this._api.listarMetas(this._filtro(), this.page, this.limit).subscribe({
      next: (r) => {
        this.cargando = false;
        if (!r.success) {
          this._error(primerError(r.errors, "Error al consultar las metas"));
          return;
        }
        this.filas = r.result || [];
        this.total = r.pagination?.total ?? this.filas.length;
      },
      error: (e) => {
        this.cargando = false;
        this._error(mensajeErrorHttp(e));
      },
    });
  }

  cambiarPagina(evento: PageEvent): void {
    this.page = evento.pageIndex + 1;
    this.limit = evento.pageSize;
    this.cargar();
  }

  abrir(meta?: IMetaVenta): void {
    this._dialog
      .open(MetaDialogComponent, {
        width: "760px",
        maxWidth: "96vw",
        data: { meta: meta ?? null, catalogos: this.catalogos },
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado === "eliminar" && meta) this.eliminar(meta);
        else if (guardado) this.cargar();
      });
  }

  eliminar(f: IMetaVenta): void {
    const texto = `${nombreMes(f.Mes)} ${f.Anio} · ${f.Vendedor} · ${f.Articulo}`;
    this._snotify.confirm(`¿Eliminar la meta ${texto}?`, {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this._api.eliminarMeta(f.IdMeta).subscribe({
              next: (r) => {
                if (r.success) {
                  this._snotify.info("La meta ha sido eliminada", { position: SnotifyPosition.rightTop });
                  this.cargar();
                } else {
                  this._error(primerError(r.errors, "No se pudo eliminar"));
                }
              },
              error: (e) => this._error(mensajeErrorHttp(e)),
            });
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }

  exportar(): void {
    this._api.todasLasMetas(this._filtro()).subscribe({
      next: (filas) =>
        exportarCsv(`metas_venta_${this.filtros.value.anio || "todas"}`, [
          { header: "Mes", valor: (f: IMetaVenta) => this.nombreMes(f.Mes) },
          { header: "Línea", valor: (f: IMetaVenta) => f.lineaNegocio?.nombre ?? "" },
          { header: "Líder", valor: (f: IMetaVenta) => f.lider?.nombre ?? "" },
          { header: "Vendedor", valor: (f: IMetaVenta) => f.vendedor?.NOMBRE ?? f.Vendedor },
          { header: "Producto", valor: (f: IMetaVenta) => f.articulo?.DESCRIPCION ?? f.Articulo },
          { header: "Proveedor", valor: (f: IMetaVenta) => f.proveedor?.codigo ?? "" },
          { header: "Incentivo", valor: (f: IMetaVenta) => aNumero(f.Incentivo) ?? "" },
          { header: "Meta (u)", valor: (f: IMetaVenta) => aNumero(f.Meta_Unidades) ?? "" },
          { header: "Mínimo", valor: (f: IMetaVenta) => aNumero(f.minimo) ?? "" },
          { header: "Vendido (u)", valor: (f: IMetaVenta) => aNumero(f.Venta_Unidades) ?? "" },
          { header: "Vendido ($)", valor: (f: IMetaVenta) => aNumero(f.Venta_Valor) ?? "" },
          {
            header: "% avance",
            valor: (f: IMetaVenta) => {
              const a = this.avance(f);
              return a === null ? "-" : `${(a * 100).toFixed(1)}%`;
            },
          },
        ], filas),
      error: (e) => this._error(mensajeErrorHttp(e)),
    });
  }

  private _filtro(): IFiltroMetas {
    const v = this.filtros.value as IFiltroMetas;
    return { ...v, anio: aNumero(v.anio) };
  }

  private _error(mensaje: string): void {
    this._snotify.error(mensaje, { position: SnotifyPosition.rightTop });
  }
}
