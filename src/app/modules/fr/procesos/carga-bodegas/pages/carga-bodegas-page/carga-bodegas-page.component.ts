import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { EMPTY, Observable, Subject, forkJoin, of } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  expand,
  last,
  map,
  switchMap,
} from "rxjs/operators";
import { BodegaFrApiService } from "@app/modules/fr/administracion/bodegas/service/bodega-fr-api.service";
import { BodegaAsocRtApiService } from "@app/modules/fr/administracion/bodegas/service/bodega-asoc-rt-api.service";
import {
  IResponseBodegaAsocRt,
  IResponseBodegaFr,
} from "@app/modules/fr/administracion/bodegas/model/bodega-fr-model-interface";
import { IResponse } from "@app/shared/api-models-base-interface";
import { BodegaErpApiService } from "../../service/bodega-erp-api.service";
import { IResponseBodegaErp } from "../../model/bodega-erp-fr-model-interface";

interface ISeleccionBodega {
  BODEGA: string;
  NOMBRE: string;
}

@Component({
  selector: "app-carga-bodegas-page",
  templateUrl: "./carga-bodegas-page.component.html",
  styleUrls: ["./carga-bodegas-page.component.scss"],
})
export class CargaBodegasPageComponent implements OnInit, OnDestroy {
  constructor(
    private _bodegaErpApiService: BodegaErpApiService,
    private _bodegaFrApiService: BodegaFrApiService,
    private _bodegaAsocRtApiService: BodegaAsocRtApiService,
    private _snotifyService: SnotifyService
  ) {}

  bodegasErp: IResponseBodegaErp[] = [];
  displayedColumns: string[] = ["seleccionado", "codigo", "descripcion"];

  q = "";
  page = 1;
  limit = 20;
  total = 0;

  cargando = false;
  procesando = false;

  selectedBodegas = new Map<string, ISeleccionBodega>();

  /** Codigos de bodegaRt ya cargados: se usan para ocultarlos del listado del ERP. */
  private _bodegasCargadas = new Set<string>();

  private _busqueda$ = new Subject<string>();

  ngOnInit(): void {
    this._busqueda$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q) => {
        this.q = q;
        this.page = 1;
        this._cargarPagina();
      });
    this._cargarBodegasCargadas().subscribe(() => this._cargarPagina());
  }

  /** Recorre todas las paginas de bodegaRt (limite maximo del backend: 100 por pagina). */
  private _cargarBodegasCargadas(): Observable<void> {
    return this._bodegaFrApiService.getBodegas(1, 100).pipe(
      expand((response) =>
        response.success &&
        response.pagination.page < response.pagination.totalPages
          ? this._bodegaFrApiService.getBodegas(
              response.pagination.page + 1,
              100
            )
          : EMPTY
      ),
      map((response) => {
        if (response.success) {
          response.result.forEach((b) => this._bodegasCargadas.add(b.BODEGA));
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
    this._bodegaErpApiService
      .getBodegasErp(this.q, this.page, this.limit)
      .subscribe({
        next: (response) => {
          this.cargando = false;
          if (response.success) {
            this.bodegasErp = response.result.filter(
              (b) => !this._bodegasCargadas.has(b.BODEGA)
            );
            this.total = response.pagination
              ? response.pagination.total
              : response.result.length;
          } else {
            this._snotifyService.error(
              response.errors?.[0] ?? "Error al consultar las bodegas del ERP",
              {
                position: SnotifyPosition.rightTop,
              }
            );
          }
        },
        error: () => {
          this.cargando = false;
          this._snotifyService.error(
            "No fue posible consultar las bodegas del ERP",
            { position: SnotifyPosition.rightTop }
          );
        },
      });
  }

  isSelected(bodega: string): boolean {
    return this.selectedBodegas.has(bodega);
  }

  toggleBodega(element: IResponseBodegaErp, checked: boolean): void {
    if (checked) {
      this.selectedBodegas.set(element.BODEGA, {
        BODEGA: element.BODEGA,
        NOMBRE: element.NOMBRE,
      });
    } else {
      this.selectedBodegas.delete(element.BODEGA);
    }
  }

  cargarSeleccionados(): void {
    if (this.selectedBodegas.size === 0 || this.procesando) {
      return;
    }
    const seleccionados = Array.from(this.selectedBodegas.values());
    this.procesando = true;

    const respuestaError = (): Observable<IResponse<IResponseBodegaAsocRt>> =>
      of<IResponse<IResponseBodegaAsocRt>>({
        success: false,
        errors: ["Error de conexión"],
        result: null as unknown as IResponseBodegaAsocRt,
      });
    const rtError = (): Observable<IResponse<IResponseBodegaFr>> =>
      of<IResponse<IResponseBodegaFr>>({
        success: false,
        errors: ["Error de conexión"],
        result: null as unknown as IResponseBodegaFr,
      });

    // "Ya esta registrada en el modulo de rutas" es la unica falla de bodegaRt que se tolera
    // (la bodega ya fue cargada antes): en ese caso igual se intenta la asociacion. Cualquier
    // otra falla se reporta tal cual, sin intentar asociar.
    const yaRegistrada = (errors: string[]): boolean =>
      (errors?.[0] ?? "").toLowerCase().includes("ya esta registrada");

    // Primero se da de alta en bodegaRt y, solo cuando esa peticion termina, se crea la
    // asociacion en bodegaAsocRt: esta ultima exige que la bodega ya exista en bodegaRt,
    // asi que no pueden dispararse en paralelo.
    const peticiones = seleccionados.map((bodega) =>
      this._bodegaFrApiService.createBodega({ bodega: bodega.BODEGA }).pipe(
        catchError(rtError),
        switchMap((rtResponse) => {
          if (!rtResponse.success && !yaRegistrada(rtResponse.errors)) {
            return of<IResponse<IResponseBodegaAsocRt>>({
              success: false,
              errors: rtResponse.errors,
              result: null as unknown as IResponseBodegaAsocRt,
            });
          }
          return this._bodegaAsocRtApiService
            .createBodega({ bodega: bodega.BODEGA, codigo: bodega.BODEGA })
            .pipe(catchError(respuestaError));
        })
      )
    );

    forkJoin(peticiones).subscribe((respuestas) => {
      this.procesando = false;
      let exitosos = 0;
      let primerError = "";

      respuestas.forEach((respuestaAsoc, index) => {
        if (respuestaAsoc.success) {
          exitosos++;
          this._bodegasCargadas.add(seleccionados[index].BODEGA);
          this.selectedBodegas.delete(seleccionados[index].BODEGA);
        } else if (!primerError) {
          primerError = respuestaAsoc.errors?.[0] ?? "";
        }
      });
      const fallidos = respuestas.length - exitosos;

      if (exitosos) {
        this._snotifyService.info(
          `${exitosos} bodega(s) cargada(s) correctamente`,
          { position: SnotifyPosition.rightTop }
        );
      }
      if (fallidos) {
        this._snotifyService.warning(
          `${fallidos} bodega(s) no se pudieron cargar: ${primerError}`,
          {
            position: SnotifyPosition.rightTop,
          }
        );
      }

      this._cargarPagina();
    });
  }
}
