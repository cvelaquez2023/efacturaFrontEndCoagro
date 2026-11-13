import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, from, of } from "rxjs";
import { catchError, concatMap, finalize, map, toArray } from "rxjs/operators";
import { ReportesFrApiService } from "../../../../reportes/shared/reportes-fr-api.service";
import { PromocionalesApiService } from "../../promocionales-api.service";
import { IFiltroPromocionales, IPromocional, Urgencia } from "../../promocionales.model";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * FR → Documentos → Promocionales: solicitudes de material promocional que hacen los vendedores desde
 * la app. Se revisan y se marcan como procesadas (una por una o varias a la vez) o se reabren.
 * Orden del backend: pendientes primero y por fecha requerida (la más próxima arriba).
 */
@Component({
  selector: "app-promocionales-page",
  templateUrl: "./promocionales-page.component.html",
  styleUrls: ["./promocionales-page.component.scss"],
})
export class PromocionalesPageComponent implements OnInit {
  readonly hoy = iso(new Date());

  filtro: IFiltroPromocionales = { docPro: "N" };
  rutas: { codigo: string; nombre: string }[] = [];
  handhelds: string[] = [];

  filas: IPromocional[] = [];
  total = 0;
  page = 1;
  limit = 20;
  cargando = false;

  /** Contadores con los mismos filtros (sin el de estado). */
  pendientes = 0;
  vencidas = 0;
  procesadas = 0;

  seleccion = new Set<number>();
  procesando = false;
  enCurso: number | null = null;

  constructor(
    private _api: PromocionalesApiService,
    private _reportes: ReportesFrApiService,
    private _snotify: SnotifyService
  ) {}

  ngOnInit(): void {
    forkJoin({
      rutas: this._reportes.getRutasAsignadas().pipe(catchError(() => of([]))),
    }).subscribe(({ rutas }) => {
      const vistos = new Set<string>();
      this.rutas = rutas
        .map((r) => String(r.RUTA).trim())
        .filter((r) => r && !vistos.has(r) && vistos.add(r))
        .sort()
        .map((codigo) => ({ codigo, nombre: codigo }));
      this.handhelds = [...new Set(rutas.map((r) => String(r.HANDHELD ?? "").trim()).filter(Boolean))].sort();
    });
    this.buscar();
  }

  buscar(): void {
    this.page = 1;
    this.seleccion.clear();
    this.cargar();
    this._contar();
  }

  limpiar(): void {
    this.filtro = { docPro: "N" };
    this.buscar();
  }

  /** Atajo de los contadores: filtra por ese estado. */
  verEstado(docPro: string | null, soloVencidas = false): void {
    this.filtro = { ...this.filtro, docPro, hasta: soloVencidas ? this._ayer() : this.filtro.hasta === this._ayer() ? null : this.filtro.hasta };
    this.buscar();
  }

  cargar(): void {
    this.cargando = true;
    this._api
      .listar(this.filtro, this.page, this.limit)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (r) => {
          if (!r.success) {
            this._error((r.errors || [])[0] || "No se pudieron consultar los promocionales");
            return;
          }
          this.filas = r.result || [];
          this.total = r.pagination?.total ?? this.filas.length;
        },
        error: () => this._error("No se pudieron consultar los promocionales"),
      });
  }

  /** Totales de pendientes, vencidas y procesadas con los demás filtros (pide solo 1 fila de cada uno). */
  private _contar(): void {
    const { docPro: _d, ...base } = this.filtro;
    const total = (f: IFiltroPromocionales) =>
      this._api.listar(f, 1, 1).pipe(
        map((r) => (r.success ? r.pagination?.total ?? 0 : 0)),
        catchError(() => of(0))
      );
    forkJoin({
      pendientes: total({ ...base, docPro: "N" }),
      vencidas: total({ ...base, docPro: "N", hasta: this._minFecha(base.hasta, this._ayer()) }),
      procesadas: total({ ...base, docPro: "S" }),
    }).subscribe((c) => {
      this.pendientes = c.pendientes;
      this.vencidas = c.vencidas;
      this.procesadas = c.procesadas;
    });
  }

  cambiarPagina(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.cargar();
  }

  // ------------------------------------------------------------------ procesar

  marcar(p: IPromocional, docPro: "S" | "N"): void {
    this.enCurso = p.ID;
    this._api
      .procesar(p.ID, docPro)
      .pipe(finalize(() => (this.enCurso = null)))
      .subscribe({
        next: (r) => {
          if (!r.success) {
            this._error((r.errors || [])[0] || "No se pudo actualizar");
            return;
          }
          this._snotify.success(docPro === "S" ? "Solicitud marcada como procesada" : "Solicitud reabierta", {
            position: SnotifyPosition.rightTop,
          });
          this.seleccion.delete(p.ID);
          this.cargar();
          this._contar();
        },
        error: () => this._error("No se pudo actualizar"),
      });
  }

  alternar(p: IPromocional): void {
    if (this.seleccion.has(p.ID)) this.seleccion.delete(p.ID);
    else this.seleccion.add(p.ID);
  }

  get pendientesEnPagina(): IPromocional[] {
    return this.filas.filter((p) => p.DOC_PRO !== "S");
  }

  get todasMarcadas(): boolean {
    return this.pendientesEnPagina.length > 0 && this.pendientesEnPagina.every((p) => this.seleccion.has(p.ID));
  }

  alternarTodas(): void {
    const marcar = !this.todasMarcadas;
    this.pendientesEnPagina.forEach((p) => (marcar ? this.seleccion.add(p.ID) : this.seleccion.delete(p.ID)));
  }

  /** Marca como procesadas las solicitudes seleccionadas (una tras otra). */
  procesarSeleccionadas(): void {
    const ids = [...this.seleccion];
    if (!ids.length || this.procesando) return;
    this.procesando = true;
    let fallidas = 0;
    from(ids)
      .pipe(
        concatMap((id) =>
          this._api.procesar(id, "S").pipe(
            map((r) => {
              if (r.success) this.seleccion.delete(id);
              else fallidas++;
            }),
            catchError(() => {
              fallidas++;
              return of(undefined);
            })
          )
        ),
        toArray(),
        finalize(() => {
          this.procesando = false;
          this.cargar();
          this._contar();
        })
      )
      .subscribe(() => {
        const ok = ids.length - fallidas;
        if (fallidas) this._error(`Se procesaron ${ok} de ${ids.length}; ${fallidas} no se pudieron actualizar.`);
        else this._snotify.success(`${ok} solicitud(es) marcadas como procesadas`, { position: SnotifyPosition.rightTop });
      });
  }

  // ------------------------------------------------------------------ presentación

  urgencia(p: IPromocional): Urgencia {
    if (p.DOC_PRO === "S") return "PROCESADA";
    const f = String(p.FECHA_REQUERIDA).slice(0, 10);
    if (f < this.hoy) return "VENCIDA";
    if (f === this.hoy) return "HOY";
    return this._diasHasta(f) <= 3 ? "PRONTO" : "A_TIEMPO";
  }

  textoUrgencia(p: IPromocional): string {
    const u = this.urgencia(p);
    const f = String(p.FECHA_REQUERIDA).slice(0, 10);
    if (u === "PROCESADA") return "Procesada";
    if (u === "VENCIDA") return `Vencida (hace ${-this._diasHasta(f)} día(s))`;
    if (u === "HOY") return "Para hoy";
    return `En ${this._diasHasta(f)} día(s)`;
  }

  private _diasHasta(fechaIso: string): number {
    const [y, m, d] = fechaIso.split("-").map(Number);
    const [hy, hm, hd] = this.hoy.split("-").map(Number);
    return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(hy, hm - 1, hd)) / 86400000);
  }

  private _ayer(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return iso(d);
  }

  private _minFecha(a: string | null | undefined, b: string): string {
    return a && a < b ? a : b;
  }

  private _error(m: string): void {
    this._snotify.error(m, { position: SnotifyPosition.rightTop, timeout: 8000 });
  }
}
