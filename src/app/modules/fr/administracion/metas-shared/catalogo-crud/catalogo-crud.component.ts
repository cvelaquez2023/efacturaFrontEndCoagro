import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { exportarCsv } from "../../../reportes/shared/reporte-utils";
import { CatalogoDialogComponent } from "../catalogo-dialog/catalogo-dialog.component";
import { MetasApiService, mensajeErrorHttp } from "../metas-api.service";
import { estaActivo, ICatalogoConfig, ICatalogoMeta, primerError } from "../metas.model";

/**
 * CRUD genérico de un catálogo de metas (Líderes, Proveedores, Líneas de Negocio):
 * búsqueda en el servidor, filtro activo/inactivo, paginación del backend, crear/editar/eliminar.
 */
@Component({
  selector: "app-catalogo-crud",
  templateUrl: "./catalogo-crud.component.html",
  styleUrls: ["./catalogo-crud.component.scss"],
})
export class CatalogoCrudComponent implements OnInit {
  @Input() config!: ICatalogoConfig;
  /** Avisa cuando se crea, edita o elimina algo (p. ej. para refrescar combos). */
  @Output() cambio = new EventEmitter<void>();

  filas: ICatalogoMeta[] = [];
  total = 0;
  page = 1;
  limit = 20;
  cargando = false;

  busqueda = new FormControl("");
  filtroActivo = new FormControl("");

  constructor(
    private _api: MetasApiService,
    private _dialog: MatDialog,
    private _snotify: SnotifyService
  ) {}

  get columnas(): string[] {
    return this.config.conEmail
      ? ["codigo", "nombre", "email", "activo", "acciones"]
      : ["codigo", "nombre", "activo", "acciones"];
  }

  ngOnInit(): void {
    this.busqueda.valueChanges.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.cargar();
    });
    this.filtroActivo.valueChanges.subscribe(() => {
      this.page = 1;
      this.cargar();
    });
    this.cargar();
  }

  activo(item: ICatalogoMeta): boolean {
    return estaActivo(item, this.config);
  }

  cargar(): void {
    this.cargando = true;
    const activo = (this.filtroActivo.value || "") as "S" | "N" | "";
    this._api
      .listarCatalogo(this.config, { q: this.busqueda.value || "", activo }, this.page, this.limit)
      .subscribe({
        next: (r) => {
          this.cargando = false;
          if (!r.success) {
            this._error(primerError(r.errors, `Error al consultar ${this.config.titulo.toLowerCase()}`));
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

  abrir(item?: ICatalogoMeta): void {
    this._dialog
      .open(CatalogoDialogComponent, {
        width: "520px",
        maxWidth: "96vw",
        data: { config: this.config, item: item ?? null },
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (guardado) {
          this.cargar();
          this.cambio.emit();
        }
      });
  }

  eliminar(item: ICatalogoMeta): void {
    this._snotify.confirm(`¿Eliminar ${this.config.articulo} ${this.config.singular} ${item.codigo} - ${item.nombre}?`, {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this._api.eliminarCatalogo(this.config, item.id).subscribe({
              next: (r) => {
                if (r.success) {
                  this._snotify.info("El registro ha sido eliminado", { position: SnotifyPosition.rightTop });
                  this.cargar();
                  this.cambio.emit();
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
    const activo = (this.filtroActivo.value || "") as "S" | "N" | "";
    this._api.todosCatalogo(this.config, activo === "S").subscribe({
      next: (filas) => {
        const lista = activo === "N" ? filas.filter((f) => !this.activo(f)) : filas;
        const columnas = [
          { header: "Código", valor: (f: ICatalogoMeta) => f.codigo },
          { header: "Nombre", valor: (f: ICatalogoMeta) => f.nombre },
          ...(this.config.conEmail ? [{ header: "Email", valor: (f: ICatalogoMeta) => f.email ?? "" }] : []),
          { header: "Activo", valor: (f: ICatalogoMeta) => (this.activo(f) ? "Sí" : "No") },
        ];
        exportarCsv(this.config.recurso, columnas, lista);
      },
      error: (e) => this._error(mensajeErrorHttp(e)),
    });
  }

  private _error(mensaje: string): void {
    this._snotify.error(mensaje, { position: SnotifyPosition.rightTop });
  }
}
