import { Component, Input, OnInit } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { finalize } from "rxjs/operators";
import { BonDescApiService, FiltroBD } from "../../bon-desc-api.service";
import { EstadoVigencia, IConfigBD, IFilaBD, llaveDe, NIVELES_PRECIO, vigenciaDe } from "../../bon-desc.model";
import { BonDescDialogComponent, IBonDescDialogData } from "../bon-desc-dialog/bon-desc-dialog.component";

const hoyIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Listado + CRUD de una de las 4 tablas (según `config`). */
@Component({
  selector: "app-tabla-bon-desc",
  templateUrl: "./tabla-bon-desc.component.html",
  styleUrls: ["./tabla-bon-desc.component.scss"],
})
export class TablaBonDescComponent implements OnInit {
  @Input() config!: IConfigBD;

  readonly niveles = NIVELES_PRECIO;
  readonly hoy = hoyIso();

  filtro: FiltroBD = {};
  soloVigentes = false;
  filas: IFilaBD[] = [];
  total = 0;
  page = 1;
  limit = 20;
  cargando = false;

  constructor(private _api: BonDescApiService, private _dialog: MatDialog, private _snotify: SnotifyService) {}

  ngOnInit(): void {
    this.cargar();
  }

  get tieneCliente(): boolean {
    return this.config.entidad.some((c) => c.tipo === "cliente");
  }

  buscar(): void {
    this.page = 1;
    this.cargar();
  }

  limpiar(): void {
    this.filtro = {};
    this.soloVigentes = false;
    this.buscar();
  }

  cargar(): void {
    this.cargando = true;
    const filtro: FiltroBD = { ...this.filtro };
    if (this.soloVigentes) filtro["vigente"] = "S";
    this._api
      .listar(this.config, filtro, this.page, this.limit)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (r) => {
          if (!r.success) {
            this._error((r.errors || []).join(", ") || "No se pudo consultar");
            return;
          }
          this.filas = r.result || [];
          this.total = r.pagination?.total ?? this.filas.length;
        },
        error: (e) => this._error(this._mensaje(e)),
      });
  }

  cambiarPagina(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.cargar();
  }

  abrir(fila: IFilaBD | null = null): void {
    this._dialog
      .open<BonDescDialogComponent, IBonDescDialogData, boolean>(BonDescDialogComponent, {
        width: "820px",
        maxWidth: "96vw",
        data: { config: this.config, fila },
      })
      .afterClosed()
      .subscribe((guardado) => {
        if (!guardado) return;
        this._snotify.success(fila ? "Cambios guardados" : `Se creó el ${this.config.singular}`, { position: SnotifyPosition.rightTop });
        this.cargar();
      });
  }

  eliminar(fila: IFilaBD): void {
    this._snotify.confirm(`¿Eliminar este ${this.config.singular} (${this.entidadTexto(fila)}, ${fila.FECHA_INICIO} a ${fila.FECHA_FIN})?`, {
      position: SnotifyPosition.rightTop,
      timeout: 0,
      buttons: [
        {
          text: "SI, ELIMINAR",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this._api.eliminar(this.config, llaveDe(this.config, fila)).subscribe({
              next: (r) => {
                if (!r.success) {
                  this._error((r.errors || []).join(", ") || "No se pudo eliminar");
                  return;
                }
                this._snotify.info("Eliminado", { position: SnotifyPosition.rightTop });
                this.cargar();
              },
              error: (e) => this._error(this._mensaje(e)),
            });
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }

  // ------------------------------------------------------------------ presentación

  vigencia(fila: IFilaBD): EstadoVigencia {
    return vigenciaDe(fila, this.hoy);
  }

  textoVigencia(e: EstadoVigencia): string {
    return e === "VIGENTE" ? "Vigente" : e === "PROGRAMADA" ? "Programada" : "Vencida";
  }

  entidadTexto(fila: IFilaBD): string {
    return this.config.entidad
      .filter((c) => c.tipo !== "moneda")
      .map((c) => String(fila[c.columna] ?? "").trim())
      .join(" / ");
  }

  textoCantidades(fila: IFilaBD): string {
    const max = Number(fila.CANT_MAX);
    return max >= 999999 ? `${fila.CANT_MIN} o más` : `${fila.CANT_MIN} a ${max}`;
  }

  /** "10 %" / "$5.00" / "Regala 2 × 16001 ALBENDAZOL…" */
  textoValor(fila: IFilaBD): string {
    if (this.config.esBonificacion) {
      const factor = fila.FACTOR_BONIF ? ` (factor ${Number(fila.FACTOR_BONIF)})` : "";
      return `Regala ${Number(fila.UNIDADES_BONIF)} × ${String(fila.ARTICULO_BONIF ?? "").trim()}${factor}`;
    }
    if (fila.PORC_DESC !== undefined) return `${Number(fila.PORC_DESC)} %`;
    return fila.TIPO === "F" ? `$${Number(fila.MONTO).toFixed(2)} fijo` : `${Number(fila.MONTO)} %`;
  }

  private _mensaje(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const errs = (e.error as { errors?: string[] } | null)?.errors;
      return errs?.length ? errs.join(", ") : e.message;
    }
    return "Ocurrió un error";
  }

  private _error(m: string): void {
    this._snotify.error(m, { position: SnotifyPosition.rightTop, timeout: 8000 });
  }
}
