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
import { ClienteFrApiService } from "@app/modules/fr/administracion/clientes/service/cliente-fr-api.service";
import { ClienteAsocRtApiService } from "@app/modules/fr/administracion/clientes/service/cliente-asoc-rt-api.service";
import {
  IResponseClienteAsocRt,
  IResponseClienteFr,
} from "@app/modules/fr/administracion/clientes/model/cliente-fr-model-interface";
import { IResponse } from "@app/shared/api-models-base-interface";
import { ClienteErpApiService } from "../../service/cliente-erp-api.service";
import {
  IResponseClienteErp,
  IResponsePaginadaClienteErp,
} from "../../model/cliente-erp-fr-model-interface";

interface ISeleccionCliente {
  CLIENTE: string;
  NOMBRE: string;
}

@Component({
  selector: "app-carga-clientes-page",
  templateUrl: "./carga-clientes-page.component.html",
  styleUrls: ["./carga-clientes-page.component.scss"],
})
export class CargaClientesPageComponent implements OnInit, OnDestroy {
  constructor(
    private _clienteErpApiService: ClienteErpApiService,
    private _clienteFrApiService: ClienteFrApiService,
    private _clienteAsocRtApiService: ClienteAsocRtApiService,
    private _snotifyService: SnotifyService
  ) {}

  clientesErp: IResponseClienteErp[] = [];
  displayedColumns: string[] = ["seleccionado", "codigo", "descripcion"];

  q = "";
  page = 1;
  limit = 20;
  total = 0;

  cargando = false;
  procesando = false;

  selectedClientes = new Map<string, ISeleccionCliente>();

  /** Codigos de clienteRt ya cargados: se usan para ocultarlos del listado del ERP. */
  private _clientesCargados = new Set<string>();

  private _busqueda$ = new Subject<string>();
  // Dispara una nueva consulta (búsqueda o cambio de página); el pipe de abajo usa switchMap para
  // cancelar la petición anterior si todavía estaba en vuelo, evitando que una respuesta vieja y
  // más lenta llegue después y sobrescriba con resultados obsoletos (mostrando un cliente distinto
  // al que se acababa de buscar).
  private _consulta$ = new Subject<void>();

  ngOnInit(): void {
    this._busqueda$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((q) => {
        this.q = q;
        this.page = 1;
        this._consulta$.next();
      });

    this._consulta$
      .pipe(
        switchMap(() => {
          this.cargando = true;
          return this._clienteErpApiService
            .getClientesErp(this.q, this.page, this.limit, "S")
            .pipe(
              catchError(() =>
                of<IResponsePaginadaClienteErp<IResponseClienteErp[]>>({
                  success: false,
                  errors: ["No fue posible consultar los clientes del ERP"],
                  result: [],
                  pagination: {
                    page: 1,
                    limit: this.limit,
                    total: 0,
                    totalPages: 1,
                  },
                })
              )
            );
        })
      )
      .subscribe((response) => {
        this.cargando = false;
        if (response.success) {
          this.clientesErp = response.result.filter(
            (c) => !this._clientesCargados.has(c.CLIENTE)
          );
          this.total = response.pagination
            ? response.pagination.total
            : response.result.length;
        } else {
          this._snotifyService.error(
            response.errors?.[0] ?? "Error al consultar los clientes del ERP",
            {
              position: SnotifyPosition.rightTop,
            }
          );
        }
      });

    this._cargarClientesCargados().subscribe(() => this._consulta$.next());
  }

  /** Recorre todas las paginas de clienteRt (limite maximo del backend: 100 por pagina). */
  private _cargarClientesCargados(): Observable<void> {
    return this._clienteFrApiService.getClientes(1, 100).pipe(
      expand((response) =>
        response.success &&
        response.pagination.page < response.pagination.totalPages
          ? this._clienteFrApiService.getClientes(
              response.pagination.page + 1,
              100
            )
          : EMPTY
      ),
      map((response) => {
        if (response.success) {
          response.result.forEach((c) => this._clientesCargados.add(c.CLIENTE));
        }
      }),
      last()
    );
  }

  ngOnDestroy(): void {
    this._busqueda$.complete();
    this._consulta$.complete();
  }

  onBuscar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this._busqueda$.next(valor.trim());
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this._consulta$.next();
  }

  isSelected(cliente: string): boolean {
    return this.selectedClientes.has(cliente);
  }

  toggleCliente(element: IResponseClienteErp, checked: boolean): void {
    if (checked) {
      this.selectedClientes.set(element.CLIENTE, {
        CLIENTE: element.CLIENTE,
        NOMBRE: element.NOMBRE,
      });
    } else {
      this.selectedClientes.delete(element.CLIENTE);
    }
  }

  cargarSeleccionados(): void {
    if (this.selectedClientes.size === 0 || this.procesando) {
      return;
    }
    const seleccionados = Array.from(this.selectedClientes.values());
    this.procesando = true;

    const respuestaError = (): Observable<IResponse<IResponseClienteAsocRt>> =>
      of<IResponse<IResponseClienteAsocRt>>({
        success: false,
        errors: ["Error de conexión"],
        result: null as unknown as IResponseClienteAsocRt,
      });
    const rtError = (): Observable<IResponse<IResponseClienteFr>> =>
      of<IResponse<IResponseClienteFr>>({
        success: false,
        errors: ["Error de conexión"],
        result: null as unknown as IResponseClienteFr,
      });

    // "Ya esta registrado en el modulo de rutas" es la unica falla de clienteRt que se tolera
    // (el cliente ya fue cargado antes): en ese caso igual se intenta la asociacion. Cualquier
    // otra falla (p. ej. cliente inactivo en el ERP) se reporta tal cual, sin intentar asociar.
    const yaRegistrado = (errors: string[]): boolean =>
      (errors?.[0] ?? "").toLowerCase().includes("ya esta registrado");

    // Primero se da de alta en clienteRt y, solo cuando esa peticion termina, se crea la
    // asociacion en clienteAsocRt: esta ultima exige que el cliente ya exista en clienteRt,
    // asi que no pueden dispararse en paralelo.
    const peticiones = seleccionados.map((cliente) =>
      this._clienteFrApiService
        .createCliente({ cliente: cliente.CLIENTE, nombre: cliente.NOMBRE })
        .pipe(
          catchError(rtError),
          switchMap((rtResponse) => {
            if (!rtResponse.success && !yaRegistrado(rtResponse.errors)) {
              return of<IResponse<IResponseClienteAsocRt>>({
                success: false,
                errors: rtResponse.errors,
                result: null as unknown as IResponseClienteAsocRt,
              });
            }
            return this._clienteAsocRtApiService
              .createCliente({
                cliente: cliente.CLIENTE,
                codigo: cliente.CLIENTE,
              })
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
          this._clientesCargados.add(seleccionados[index].CLIENTE);
          this.selectedClientes.delete(seleccionados[index].CLIENTE);
        } else if (!primerError) {
          primerError = respuestaAsoc.errors?.[0] ?? "";
        }
      });
      const fallidos = respuestas.length - exitosos;

      if (exitosos) {
        this._snotifyService.info(
          `${exitosos} cliente(s) cargado(s) correctamente`,
          { position: SnotifyPosition.rightTop }
        );
      }
      if (fallidos) {
        this._snotifyService.warning(
          `${fallidos} cliente(s) no se pudieron cargar: ${primerError}`,
          {
            position: SnotifyPosition.rightTop,
          }
        );
      }

      this._consulta$.next();
    });
  }
}
