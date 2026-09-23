import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { Observable, Subject, forkJoin, of } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs/operators";
import { ClienteFrApiService } from "@app/modules/fr/administracion/clientes/service/cliente-fr-api.service";
import { ClienteAsocRtApiService } from "@app/modules/fr/administracion/clientes/service/cliente-asoc-rt-api.service";
import { IResponseClienteFr } from "@app/modules/fr/administracion/clientes/model/cliente-fr-model-interface";
import { IResponse } from "@app/shared/api-models-base-interface";
import { RutaApiService } from "@app/modules/fr/rutas/rutas/service/ruta-api.service";
import { IResponseRuta } from "@app/modules/fr/rutas/rutas/model/ruta-fr-model-interface";
import { RutaClienteApiService } from "@app/modules/fr/rutas/asignacion-rutas/service/ruta-cliente-api.service";
import {
  DIA_NUMERO,
  DIAS_SEMANA,
  DiaSemana,
  IResponseRutaCliente,
} from "@app/modules/fr/rutas/asignacion-rutas/model/asignacion-ruta-model-interface";
import { ClienteErpApiService } from "../../service/cliente-erp-api.service";
import {
  IResponseClienteErp,
  IResponsePaginadaClienteErp,
} from "../../model/cliente-erp-fr-model-interface";

interface ISeleccionCliente {
  CLIENTE: string;
  NOMBRE: string;
}

interface ISeleccionClienteConRutaDia extends ISeleccionCliente {
  ruta: string;
  dia: DiaSemana | "";
}

/** Un cliente ya dado de alta en clienteRt/clienteAsocRt, con su CODIGO de ruteo real resuelto
 *  (puede ser el CLIENTE mismo, o uno ya existente de antes — ver cargarSeleccionados). */
interface ISeleccionClienteCargado extends ISeleccionClienteConRutaDia {
  codigo: string;
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
    private _rutaApiService: RutaApiService,
    private _rutaClienteApiService: RutaClienteApiService,
    private _snotifyService: SnotifyService
  ) {}

  clientesErp: IResponseClienteErp[] = [];
  displayedColumns: string[] = [
    "seleccionado",
    "codigo",
    "descripcion",
    "ruta",
    "dia",
  ];

  /** Catálogo de rutas para el desplegable de carga rápida. "No seleccionado" (valor "") deja
   *  el cliente sin ruta ni día — se carga igual, para asignarlo manualmente después. */
  rutas: IResponseRuta[] = [];
  dias = DIAS_SEMANA;

  q = "";
  page = 1;
  limit = 20;
  total = 0;

  cargando = false;
  procesando = false;

  selectedClientes = new Map<string, ISeleccionCliente>();

  /** Ruta y día elegidos por cliente en los desplegables de la grilla (independiente del
   *  checkbox, así se pueden precargar antes de marcar o ajustar después sin perder la marca). */
  private _rutaPorCliente = new Map<string, string>();
  private _diaPorCliente = new Map<string, DiaSemana | "">();

  /** CLIENTE -> CODIGO de todas las asociaciones ya existentes (clienteAsocRt). Un cliente con
   *  entrada aquí ya pasó por "Cargar Clientes" alguna vez (o fue asociado por otro medio). */
  private _codigoPorCliente = new Map<string, string>();

  /** CODIGOs que ya tienen al menos un día asignado en alguna ruta ahora mismo. Solo estos se
   *  ocultan del listado del ERP: un cliente ya cargado pero SIN ruta/día activo (porque nunca se
   *  le asignó uno, o porque se le quitó desde Asignación de Rutas) se sigue mostrando, para poder
   *  cargarlo/asignarlo de nuevo — en la misma ruta o en otra. */
  private _clientesConRutaActiva = new Set<string>();

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
          this.clientesErp = response.result.filter((c) => {
            const codigo = this._codigoPorCliente.get(c.CLIENTE);
            return !(codigo != null && this._clientesConRutaActiva.has(codigo));
          });
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

    this._cargarEstadoClientes().subscribe(() => this._consulta$.next());

    this._rutaApiService.getRutas().subscribe({
      next: (response) => {
        if (response.success) {
          // Orden correlativo (RT01, RT02, RT03...) para encontrar la ruta correcta rápido y
          // evitar elegir por error una ruta distinta a la que se busca.
          this.rutas = [...response.result].sort((a, b) =>
            a.RUTA.localeCompare(b.RUTA, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          );
        }
      },
    });
  }

  /** Trae, de una vez, con qué CODIGO está asociado cada cliente y qué CODIGOs tienen ruta/día
   *  activo ahora mismo — así el listado del ERP puede distinguir entre "ya cargado y asignado"
   *  (se oculta) y "ya cargado pero sin ruta/día" (se sigue mostrando). */
  private _cargarEstadoClientes(): Observable<void> {
    return forkJoin([
      this._clienteAsocRtApiService.getCodigosPorCliente(),
      this._rutaClienteApiService.getClientesConRuta(),
    ]).pipe(
      map(([codigoPorCliente, clientesConRuta]) => {
        this._codigoPorCliente = codigoPorCliente;
        this._clientesConRutaActiva = clientesConRuta;
      })
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

  rutaSeleccionada(cliente: string): string {
    return this._rutaPorCliente.get(cliente) ?? "";
  }

  diaSeleccionadoCliente(cliente: string): DiaSemana | "" {
    return this._diaPorCliente.get(cliente) ?? "";
  }

  onRutaChange(cliente: string, ruta: string): void {
    this._rutaPorCliente.set(cliente, ruta);
  }

  onDiaChange(cliente: string, dia: DiaSemana | ""): void {
    this._diaPorCliente.set(cliente, dia);
  }

  cargarSeleccionados(): void {
    if (this.selectedClientes.size === 0 || this.procesando) {
      return;
    }
    const seleccionados: ISeleccionClienteConRutaDia[] = Array.from(
      this.selectedClientes.values()
    ).map((c) => ({
      ...c,
      ruta: this._rutaPorCliente.get(c.CLIENTE) ?? "",
      dia: this._diaPorCliente.get(c.CLIENTE) ?? "",
    }));
    this.procesando = true;

    const rtError = (): Observable<IResponse<IResponseClienteFr>> =>
      of<IResponse<IResponseClienteFr>>({
        success: false,
        errors: ["Error de conexión"],
        result: null as unknown as IResponseClienteFr,
      });
    const codigoError = (): Observable<IResponse<string>> =>
      of<IResponse<string>>({
        success: false,
        errors: ["Error de conexión"],
        result: "",
      });

    // "Ya esta registrado en el modulo de rutas" es la unica falla de clienteRt que se tolera
    // (el cliente ya fue cargado antes, p. ej. porque se quitó de una ruta y se vuelve a cargar):
    // en ese caso igual se resuelve su CODIGO. Cualquier otra falla (p. ej. cliente inactivo en
    // el ERP) se reporta tal cual, sin continuar.
    const yaRegistrado = (errors: string[]): boolean =>
      (errors?.[0] ?? "").toLowerCase().includes("ya esta registrado");

    // Primero se da de alta en clienteRt y, solo cuando esa peticion termina, se resuelve el
    // CODIGO de ruteo real: si el cliente ya tiene una asociación de antes (mismo caso de arriba)
    // se reutiliza ese CODIGO en vez de asumir que es igual al CLIENTE — el mismo problema que el
    // agente VBV/AG01 (ver AgenteAsocRtApiService.resolverCodigoAgente).
    const peticiones = seleccionados.map((cliente) =>
      this._clienteFrApiService
        .createCliente({ cliente: cliente.CLIENTE, nombre: cliente.NOMBRE })
        .pipe(
          catchError(rtError),
          switchMap((rtResponse) => {
            if (!rtResponse.success && !yaRegistrado(rtResponse.errors)) {
              return of<IResponse<string>>({
                success: false,
                errors: rtResponse.errors,
                result: "",
              });
            }

            const codigoExistente = this._codigoPorCliente.get(cliente.CLIENTE);
            if (codigoExistente) {
              return of<IResponse<string>>({
                success: true,
                errors: [],
                result: codigoExistente,
              });
            }

            return this._clienteAsocRtApiService
              .createCliente({
                cliente: cliente.CLIENTE,
                codigo: cliente.CLIENTE,
              })
              .pipe(
                map(
                  (asoc): IResponse<string> =>
                    asoc.success
                      ? { success: true, errors: [], result: cliente.CLIENTE }
                      : { success: false, errors: asoc.errors, result: "" }
                ),
                catchError(codigoError)
              );
          })
        )
    );

    forkJoin(peticiones)
      .pipe(
        switchMap((respuestas) => {
          const exitosos: ISeleccionClienteCargado[] = [];
          let primerError = "";
          respuestas.forEach((respuesta, index) => {
            if (respuesta.success) {
              exitosos.push({ ...seleccionados[index], codigo: respuesta.result });
            } else if (!primerError) {
              primerError = respuesta.errors?.[0] ?? "";
            }
          });
          const fallidos = respuestas.length - exitosos.length;
          return this._asignarRutaDia(exitosos).pipe(
            map((asignacion) => ({ exitosos, fallidos, primerError, asignacion }))
          );
        })
      )
      .subscribe(({ exitosos, fallidos, primerError, asignacion }) => {
        exitosos.forEach((c) => {
          this.selectedClientes.delete(c.CLIENTE);
          this._rutaPorCliente.delete(c.CLIENTE);
          this._diaPorCliente.delete(c.CLIENTE);
        });

        if (exitosos.length) {
          this._snotifyService.info(
            `${exitosos.length} cliente(s) cargado(s) correctamente`,
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
        if (asignacion.exitosos) {
          this._snotifyService.info(
            `${asignacion.exitosos} cliente(s) asignado(s) a su ruta y día`,
            { position: SnotifyPosition.rightTop }
          );
        }
        if (asignacion.fallidos) {
          this._snotifyService.warning(
            `${asignacion.fallidos} cliente(s) se cargaron pero no se pudieron asignar a la ruta/día elegidos: ${asignacion.primerError}`,
            { position: SnotifyPosition.rightTop }
          );
        }

        // Refresca códigos y rutas activas antes de recargar la página: así un cliente que quedó
        // sin ruta/día (o falló la asignación) sigue apareciendo, y el que sí quedó asignado se
        // oculta.
        this.procesando = false;
        this._cargarEstadoClientes().subscribe(() => this._consulta$.next());
      });
  }

  /** Para los clientes recién cargados con ruta y día elegidos en la grilla, los asigna a esa
   *  ruta/día (equivalente a lo que hace el calendario de Asignación de Rutas). Se agrupan por
   *  ruta porque, además de calcular el ORDEN correlativo por día, aplica la misma regla que ahí:
   *  un cliente solo puede tener UN día por ruta (PK RUTA+CLIENTE+DIA); si ya tenía otro día en
   *  esa ruta se mueve (se borra y se crea en el nuevo), nunca queda duplicado. Los clientes sin
   *  ruta o sin día (valor "No seleccionado") se omiten, para quedar disponibles para asignar
   *  manual. */
  private _asignarRutaDia(
    clientes: ISeleccionClienteCargado[]
  ): Observable<{ exitosos: number; fallidos: number; primerError: string }> {
    const conRutaYDia = clientes.filter((c) => c.ruta && c.dia);
    if (conRutaYDia.length === 0) {
      return of({ exitosos: 0, fallidos: 0, primerError: "" });
    }

    const porRuta = new Map<string, ISeleccionClienteCargado[]>();
    conRutaYDia.forEach((c) => {
      const grupo = porRuta.get(c.ruta) ?? [];
      grupo.push(c);
      porRuta.set(c.ruta, grupo);
    });

    const errorConexion = (): Observable<IResponse<IResponseRutaCliente>> =>
      of<IResponse<IResponseRutaCliente>>({
        success: false,
        errors: ["Error de conexión"],
        result: null as unknown as IResponseRutaCliente,
      });

    const peticionesPorRuta = Array.from(porRuta.entries()).map(
      ([ruta, clientesRuta]) =>
        this._rutaClienteApiService.getAllRutaCliente(ruta).pipe(
          catchError(() => of<IResponseRutaCliente[]>([])),
          switchMap((existentes) => {
            // Cuenta actual por día, para el ORDEN correlativo de las nuevas asignaciones.
            const contadorPorDia = new Map<number, number>();
            existentes.forEach((r) =>
              contadorPorDia.set(r.DIA, (contadorPorDia.get(r.DIA) ?? 0) + 1)
            );
            const diaActualPorCliente = new Map(
              existentes.map((r) => [r.CLIENTE, r.DIA])
            );

            const operaciones = clientesRuta.map((c) => {
              const diaNuevo = DIA_NUMERO[c.dia as DiaSemana];
              const diaActual = diaActualPorCliente.get(c.codigo);

              if (diaActual === diaNuevo) {
                // Ya está en ese día en esa ruta: nada que hacer, se cuenta como éxito.
                return of<IResponse<IResponseRutaCliente>>({
                  success: true,
                  errors: [],
                  result: null as unknown as IResponseRutaCliente,
                });
              }

              const orden = (contadorPorDia.get(diaNuevo) ?? 0) + 1;
              contadorPorDia.set(diaNuevo, orden);
              const crear$ = this._rutaClienteApiService
                .createRutaCliente({
                  ruta,
                  cliente: c.codigo,
                  dia: diaNuevo,
                  orden,
                })
                .pipe(catchError(errorConexion));

              if (diaActual == null) return crear$;

              // Ya tenía otro día en esta misma ruta: se mueve (se borra el anterior y se crea
              // en el nuevo), igual que dobleClickCliente en Mantenimiento de Asignación de Ruta.
              return this._rutaClienteApiService
                .deleteRutaCliente(ruta, c.codigo, diaActual)
                .pipe(
                  catchError(() =>
                    of<IResponse<number>>({
                      success: false,
                      errors: ["Error de conexión"],
                      result: 0,
                    })
                  ),
                  switchMap((borrado) =>
                    borrado.success
                      ? crear$
                      : of<IResponse<IResponseRutaCliente>>({
                          success: false,
                          errors: borrado.errors,
                          result: null as unknown as IResponseRutaCliente,
                        })
                  )
                );
            });

            return forkJoin(operaciones);
          })
        )
    );

    return forkJoin(peticionesPorRuta).pipe(
      map((resultadosPorRuta) => {
        let exitosos = 0;
        let primerError = "";
        resultadosPorRuta.flat().forEach((r) => {
          if (r.success) {
            exitosos++;
          } else if (!primerError) {
            primerError = r.errors?.[0] ?? "";
          }
        });
        return {
          exitosos,
          fallidos: conRutaYDia.length - exitosos,
          primerError,
        };
      })
    );
  }
}
