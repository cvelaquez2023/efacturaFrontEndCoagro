import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { exportarCsv } from "../../../../reportes/shared/reporte-utils";
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
} from "../../../metas-shared/metas.model";
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
  readonly configLineas = CATALOGO_LINEAS_NEGOCIO;

  readonly columnas = [
    "anio",
    "mes",
    "linea",
    "lider",
    "vendedor",
    "articulo",
    "proveedor",
    "meta",
    "ventaUnidades",
    "ventaValor",
    "cumplimiento",
    "acciones",
  ];

  filtros: FormGroup;
  catalogos: ICatalogosMetas = { lineas: [], lideres: [], proveedores: [], vendedores: [] };
  filas: IMetaVenta[] = [];
  total = 0;
  page = 1;
  limit = 20;
  cargando = false;
  tab = 0;

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
    }).subscribe((c) => (this.catalogos = c));
  }

  cambiarTab(indice: number): void {
    this.tab = indice;
    if (indice === 0) this.buscar();
  }

  buscar(): void {
    this.page = 1;
    this.cargar();
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
    this.buscar();
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

  /** % de cumplimiento (venta / meta), null si no hay venta o la meta es 0. */
  cumplimiento(f: IMetaVenta): number | null {
    const meta = aNumero(f.Meta_Unidades);
    const venta = aNumero(f.Venta_Unidades);
    return meta && venta !== null ? (venta / meta) * 100 : null;
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
        if (guardado) this.cargar();
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
          { header: "Año", valor: (f: IMetaVenta) => f.Anio },
          { header: "Mes", valor: (f: IMetaVenta) => f.Mes },
          { header: "Línea de negocio", valor: (f: IMetaVenta) => f.lineaNegocio?.codigo ?? "" },
          { header: "Líder", valor: (f: IMetaVenta) => f.lider?.codigo ?? "" },
          { header: "Vendedor", valor: (f: IMetaVenta) => f.Vendedor },
          { header: "Nombre vendedor", valor: (f: IMetaVenta) => f.vendedor?.NOMBRE ?? "" },
          { header: "Artículo", valor: (f: IMetaVenta) => f.Articulo },
          { header: "Descripción", valor: (f: IMetaVenta) => f.articulo?.DESCRIPCION ?? "" },
          { header: "Proveedor", valor: (f: IMetaVenta) => f.proveedor?.codigo ?? "" },
          { header: "Meta unidades", valor: (f: IMetaVenta) => aNumero(f.Meta_Unidades) ?? "" },
          { header: "Venta unidades", valor: (f: IMetaVenta) => aNumero(f.Venta_Unidades) ?? "" },
          { header: "Venta valor", valor: (f: IMetaVenta) => aNumero(f.Venta_Valor) ?? "" },
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
