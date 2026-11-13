import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { hoyIso } from "../../../../reportes/shared/reporte-utils";
import { mensajeErrorComercial } from "../../../condiciones-comerciales-shared/catalogos-comerciales.service";
import {
  DESTINOS,
  ESTADOS,
  EstadoRegla,
  fmtFechaCorta,
  IPromocion,
  IPromocionBody,
  NOMBRE_ESTADO,
  TIPOS_PROMOCION,
} from "../../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { PromocionApiService } from "../../service/promocion-api.service";
import {
  IPromocionDialogData,
  PromocionDialogComponent,
} from "../promocion-dialog/promocion-dialog.component";

/**
 * Promociones y Descuentos de Temporada: descuentos %, precios especiales y bonificaciones
 * ("compre X y lleve Y") con fecha de inicio y fin. El estado (Programada / Vigente / Vencida)
 * se calcula por fecha: no hay que activar ni desactivar nada a mano cuando empieza o termina.
 */
@Component({
  selector: "app-promociones-page",
  templateUrl: "./promociones-page.component.html",
  styleUrls: [
    "../../../condiciones-comerciales-shared/_comercial.scss",
    "./promociones-page.component.scss",
  ],
})
export class PromocionesPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _api: PromocionApiService,
    private _dialog: MatDialog,
    private _snotify: SnotifyService
  ) {}

  readonly modoPrueba = !PromocionApiService.BACKEND_DISPONIBLE;
  readonly estados = ESTADOS;
  readonly nombreEstado = NOMBRE_ESTADO;
  textoEstado(estado: string): string {
    return (NOMBRE_ESTADO as Record<string, string>)[estado] ?? estado;
  }
  readonly fmtFecha = fmtFechaCorta;

  displayedColumns = ["titulo", "tipo", "desde", "hasta", "destino", "estado", "acciones"];
  dataSource = new MatTableDataSource<IPromocion>();
  todas: IPromocion[] = [];
  vigentes: IPromocion[] = [];
  verVigentes = true;
  filtroTexto = "";
  filtroEstado: EstadoRegla | "" = "";
  cargando = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.cargar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (p, col) =>
      col === "desde"
        ? p.FECHA_INICIO
        : col === "hasta"
        ? p.FECHA_FIN
        : col === "titulo"
        ? p.TITULO.toUpperCase()
        : col === "estado"
        ? p.ESTADO
        : col === "tipo"
        ? p.TIPO
        : col === "destino"
        ? p.DESTINO
        : "";
  }

  cargar(): void {
    this.cargando = true;
    this._api.getPromociones({ fecha: hoyIso() }).subscribe({
      next: (filas) => {
        this.todas = filas;
        this.vigentes = filas
          .filter((p) => p.ESTADO === "VIGENTE")
          .sort((a, b) => a.FECHA_FIN.localeCompare(b.FECHA_FIN));
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (e: unknown) => {
        this.cargando = false;
        this._error(mensajeErrorComercial(e, "No se pudieron cargar las promociones"));
      },
    });
  }

  aplicarFiltros(): void {
    const q = this.filtroTexto.trim().toUpperCase();
    this.dataSource.data = this.todas
      .filter((p) => !this.filtroEstado || p.ESTADO === this.filtroEstado)
      .filter((p) => !q || p.TITULO.toUpperCase().includes(q))
      .sort((a, b) => b.FECHA_INICIO.localeCompare(a.FECHA_INICIO));
    this.paginator?.firstPage();
  }

  nombreTipo(p: IPromocion): string {
    return TIPOS_PROMOCION.find((t) => t.codigo === p.TIPO)?.nombre ?? p.TIPO;
  }

  textoDestino(p: IPromocion): string {
    if (p.DESTINO === "T") return "Todos los clientes";
    const nombre = DESTINOS.find((d) => d.codigo === p.DESTINO)?.nombre ?? "";
    const lista = p.destinos.map((d) => d.DESCRIPCION || d.VALOR);
    return `${nombre}: ${lista.slice(0, 3).join(", ")}${lista.length > 3 ? ` y ${lista.length - 3} más` : ""}`;
  }

  abrir(promocion?: IPromocion, duplicar = false): void {
    const data: IPromocionDialogData = { promocion, duplicar };
    this._dialog
      .open(PromocionDialogComponent, {
        width: "920px",
        maxWidth: "96vw",
        maxHeight: "94vh",
        data,
      })
      .afterClosed()
      .subscribe((guardada?: IPromocion) => {
        if (guardada) this.cargar();
      });
  }

  alternarActiva(p: IPromocion): void {
    const body: IPromocionBody = {
      ...PromocionApiService.aCuerpo(p),
      activa: p.ACTIVA === "S" ? "N" : "S",
    };
    this._api.updatePromocion(p.ID, body).subscribe({
      next: (r) => {
        if (!r.success) return this._error(r.errors?.join(". ") || "No se pudo actualizar");
        this._snotify.info(body.activa === "S" ? "Promoción activada" : "Promoción desactivada", {
          position: SnotifyPosition.rightTop,
        });
        this.cargar();
      },
      error: (e: unknown) => this._error(mensajeErrorComercial(e, "No se pudo actualizar")),
    });
  }

  eliminar(p: IPromocion): void {
    this._snotify.confirm(`¿Eliminar la promoción "${p.TITULO}"?`, {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this._api.deletePromocion(p.ID).subscribe({
              next: (r) => {
                if (!r.success) return this._error(r.errors?.join(". ") || "No se pudo eliminar");
                this._snotify.info("Promoción eliminada", { position: SnotifyPosition.rightTop });
                this.cargar();
              },
              error: (e: unknown) => this._error(mensajeErrorComercial(e, "No se pudo eliminar")),
            });
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }

  private _error(texto: string): void {
    this._snotify.error(texto, { position: SnotifyPosition.rightTop });
  }
}
