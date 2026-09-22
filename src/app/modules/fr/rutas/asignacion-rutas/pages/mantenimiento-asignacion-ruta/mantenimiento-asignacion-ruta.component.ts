import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { Observable, forkJoin, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { GrupoArticuloApiService } from "@app/modules/fr/administracion/grupos-articulos/service/grupo-articulo-api.service";
import { HandheldApiService } from "@app/modules/fr/administracion/handhelds/service/handheld-api.service";
import { ClienteAsocRtApiService } from "@app/modules/fr/administracion/clientes/service/cliente-asoc-rt-api.service";
import { IResponseClienteConAsoc } from "@app/modules/fr/administracion/clientes/model/cliente-fr-model-interface";
import { BodegaAsocRtApiService } from "@app/modules/fr/administracion/bodegas/service/bodega-asoc-rt-api.service";
import { VendedorErpApiService } from "@app/modules/fr/administracion/agentes/service/vendedor-erp-api.service";
import { RutaApiService } from "../../../rutas/service/ruta-api.service";
import {
  F1SelectorComponent,
  IF1Item,
} from "../../../shared/f1-selector/f1-selector.component";
import { COMPANIAS_DISPONIBLES } from "../../model/asignacion-ruta-mock-data";
import {
  DIA_NUMERO,
  DIAS_SEMANA,
  DiaSemana,
  IAsignacionRutaFr,
  IResponseRutaCliente,
} from "../../model/asignacion-ruta-model-interface";
import { RutaClienteApiService } from "../../service/ruta-cliente-api.service";

interface IResultadoAsignacion {
  success: boolean;
  errors: string[];
}

const MODELO_VACIO: IAsignacionRutaFr = {
  ruta: "",
  descripcion: "",
  compania: "",
  companiaNombre: "",
  activa: true,
  grupoArticulo: "",
  grupoArticuloNombre: "",
  agente: "",
  agenteNombre: "",
  handheld: "",
  handheldNombre: "",
  bodega: "",
  bodegaNombre: "",
};

// Mantenimiento de Asignación de Rutas (manual FRd pag. 50), reutilizado para Crear y Editar.
// Cabecera Ruta Asignada / Asignación de Agente / Actividad de la Ruta: se guarda de forma real
// contra /fr/rutaAsignadaRt (ver AsignacionRutasPageComponent). Ruta, Grupo Artículo, HandHeld y
// Camión/Bodega son F1 reales (Ruta contra /fr/rutaRt, Bodega contra /fr/bodegaAsocRt). El picker
// de Agente lista el catálogo de vendedores del ERP (/fr/vendedorErp, a pedido del usuario — no
// solo los que ya tienen código de ruteo en /fr/agenteAsocRt). OJO: RUTA_ASIGNADA_RT.AGENTE valida
// contra AGENTE_ASOC_RT.CODIGO en el backend, no contra el VENDEDOR crudo del ERP, así que guardar
// la ruta solo funciona hoy para el vendedor que ya tiene esa asociación (VBV -> AG01); para el
// resto el backend responderá "El agente X no existe en el modulo de rutas..." hasta que alguien
// cree su asociación (POST /fr/agenteRt + POST /fr/agenteAsocRt). Compañía sigue siendo F1 mock
// (el sistema no maneja compañías, ver RUTA_ASIGNADA_RT.COMPANIA en el backend).
@Component({
  selector: "app-mantenimiento-asignacion-ruta",
  templateUrl: "./mantenimiento-asignacion-ruta.component.html",
  styleUrls: ["./mantenimiento-asignacion-ruta.component.scss"],
})
export class MantenimientoAsignacionRutaComponent
  implements OnInit, AfterViewInit
{
  modelo: IAsignacionRutaFr;

  clientes = new MatTableDataSource<IResponseClienteConAsoc>();
  displayedColumnsClientes: string[] = ["cliente", "nombre"];
  cargandoClientes = true;

  dias = DIAS_SEMANA;
  diaSeleccionado: DiaSemana | "" = "";
  asignaciones: IResponseRutaCliente[] = [];
  cargandoAsignaciones = false;
  private _asignando = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public ediData: IAsignacionRutaFr | null,
    private _dialogRef: MatDialogRef<MantenimientoAsignacionRutaComponent>,
    private _dialog: MatDialog,
    private _snotifyService: SnotifyService,
    private _rutaApiService: RutaApiService,
    private _grupoArticuloApiService: GrupoArticuloApiService,
    private _handheldApiService: HandheldApiService,
    private _clienteAsocRtApiService: ClienteAsocRtApiService,
    private _bodegaAsocRtApiService: BodegaAsocRtApiService,
    private _vendedorErpApiService: VendedorErpApiService,
    private _rutaClienteApiService: RutaClienteApiService
  ) {
    this.modelo = { ...MODELO_VACIO, ...this.ediData };
  }

  get esNuevo(): boolean {
    return !this.ediData;
  }

  ngOnInit(): void {
    this._clienteAsocRtApiService.getClientesConNombre().subscribe({
      next: (response) => {
        this.cargandoClientes = false;
        if (response.success) {
          this.clientes.data = [...response.result].sort((a, b) =>
            a.CODIGO.localeCompare(b.CODIGO)
          );
        } else {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
      error: () => {
        this.cargandoClientes = false;
        this._snotifyService.error(
          "No fue posible consultar los clientes de la ruta",
          { position: SnotifyPosition.rightTop }
        );
      },
    });
    this._cargarAsignaciones();
  }

  ngAfterViewInit(): void {
    this.clientes.paginator = this.paginator;
    this.clientes.sort = this.sort;
    this.clientes.filterPredicate = (c, filtro) =>
      `${c.CODIGO} ${c.NOMBRE}`.toLowerCase().includes(filtro);
  }

  applyFilterClientes(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.clientes.filter = filterValue.trim().toLowerCase();
  }

  // Ya no abre un diálogo: el cliente se asigna directo al día seleccionado en el calendario
  // de la derecha. Si el cliente ya tenía otro día en esta ruta, se mueve (se borra el anterior
  // y se crea el nuevo) — así se corrige un día equivocado sin pasos extra.
  //
  // IMPORTANTE: /fr/rutaCliente valida y guarda el CLIENTE crudo del ERP, sino el CODIGO de
  // CLIENTE_ASOC_RT (regla de oro del módulo de rutas) — por eso aquí siempre se usa
  // `cliente.CODIGO`, nunca `cliente.CLIENTE`. Usar CLIENTE en vez de CODIGO es lo que producía
  // el error "El cliente X no existe en el modulo de rutas..." para clientes cuyo CODIGO de
  // ruteo es distinto de su CLIENTE crudo del ERP.
  dobleClickCliente(cliente: IResponseClienteConAsoc): void {
    if (!this.modelo.ruta) {
      this._snotifyService.warning("Seleccione primero una Ruta", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    if (!this.diaSeleccionado) {
      this._snotifyService.warning(
        "Seleccione primero un día en el calendario",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    if (this._asignando) return;

    const dia = this.diaSeleccionado;
    const asignacionActual = this.asignaciones.find(
      (a) => a.CLIENTE === cliente.CODIGO
    );
    if (asignacionActual && asignacionActual.DIA === DIA_NUMERO[dia]) {
      this._snotifyService.warning(
        `${cliente.CODIGO} ya está asignado al día ${dia}`,
        { position: SnotifyPosition.rightTop }
      );
      return;
    }

    this._asignando = true;
    const eliminarAnterior$: Observable<IResultadoAsignacion> = asignacionActual
      ? this._rutaClienteApiService
          .deleteRutaCliente(
            this.modelo.ruta,
            cliente.CODIGO,
            asignacionActual.DIA
          )
          .pipe(map((r) => ({ success: r.success, errors: r.errors })))
      : of({ success: true, errors: [] });

    eliminarAnterior$
      .pipe(
        switchMap((eliminarResponse) => {
          if (!eliminarResponse.success) return of(eliminarResponse);
          const enEseDia = this.asignaciones.filter(
            (a) => a.DIA === DIA_NUMERO[dia] && a.CLIENTE !== cliente.CODIGO
          );
          return this._rutaClienteApiService
            .createRutaCliente({
              ruta: this.modelo.ruta,
              cliente: cliente.CODIGO,
              dia: DIA_NUMERO[dia],
              orden: enEseDia.length + 1,
            })
            .pipe(map((r) => ({ success: r.success, errors: r.errors })));
        })
      )
      .subscribe({
        next: (response) => {
          this._asignando = false;
          if (!response.success) {
            this._snotifyService.error(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
            return;
          }
          this._snotifyService.info(
            `${cliente.CODIGO} se asignó al día ${dia}`,
            { position: SnotifyPosition.rightTop }
          );
          this._cargarAsignaciones();
        },
        error: () => {
          this._asignando = false;
          this._snotifyService.error(
            "No fue posible asignar el cliente al día",
            { position: SnotifyPosition.rightTop }
          );
        },
      });
  }

  seleccionarDia(dia: DiaSemana): void {
    this.diaSeleccionado = this.diaSeleccionado === dia ? "" : dia;
  }

  clientesDelDia(dia: DiaSemana): IResponseRutaCliente[] {
    return this.asignaciones
      .filter((a) => a.DIA === DIA_NUMERO[dia])
      .sort((a, b) => a.ORDEN - b.ORDEN);
  }

  /** `codigo` aquí es CLIENTE_ASOC_RT.CODIGO (lo que guarda RUTA_CLIENTE.CLIENTE), no el CLIENTE
   *  crudo del ERP — por eso se busca por CODIGO, no por CLIENTE. */
  nombreCliente(codigo: string): string {
    return this.clientes.data.find((c) => c.CODIGO === codigo)?.NOMBRE ?? "";
  }

  // Quita al cliente de ese día (p. ej. por error); una vez fuera, un doble clic sobre el
  // cliente con otro día seleccionado lo mueve al día correcto.
  quitarAsignacion(asignacion: IResponseRutaCliente): void {
    if (this._asignando) return;
    this._asignando = true;
    this._rutaClienteApiService
      .deleteRutaCliente(asignacion.RUTA, asignacion.CLIENTE, asignacion.DIA)
      .subscribe({
        next: (response) => {
          this._asignando = false;
          if (!response.success) {
            this._snotifyService.error(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
            return;
          }
          this._snotifyService.info(
            `${asignacion.CLIENTE} se quitó de ese día`,
            { position: SnotifyPosition.rightTop }
          );
          this._cargarAsignaciones();
        },
        error: () => {
          this._asignando = false;
          this._snotifyService.error("No fue posible quitar la asignación", {
            position: SnotifyPosition.rightTop,
          });
        },
      });
  }

  // Cambia la prioridad de entrega de un cliente dentro de su día: intercambia su ORDEN con el
  // del cliente vecino (el anterior o el siguiente en la lista, ya ordenada por ORDEN).
  moverOrden(
    dia: DiaSemana,
    asignacion: IResponseRutaCliente,
    direccion: "arriba" | "abajo"
  ): void {
    if (this._asignando) return;

    const clientesDia = this.clientesDelDia(dia);
    const index = clientesDia.findIndex(
      (a) => a.CLIENTE === asignacion.CLIENTE
    );
    const indexVecino = direccion === "arriba" ? index - 1 : index + 1;
    if (index === -1 || indexVecino < 0 || indexVecino >= clientesDia.length)
      return;

    const vecino = clientesDia[indexVecino];
    this._asignando = true;
    forkJoin([
      this._rutaClienteApiService.updateRutaCliente(
        asignacion.RUTA,
        asignacion.CLIENTE,
        asignacion.DIA,
        vecino.ORDEN
      ),
      this._rutaClienteApiService.updateRutaCliente(
        vecino.RUTA,
        vecino.CLIENTE,
        vecino.DIA,
        asignacion.ORDEN
      ),
    ]).subscribe({
      next: ([r1, r2]) => {
        this._asignando = false;
        if (!r1.success || !r2.success) {
          this._snotifyService.error(r1.errors[0] ?? r2.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
        this._cargarAsignaciones();
      },
      error: () => {
        this._asignando = false;
        this._snotifyService.error("No fue posible cambiar el orden", {
          position: SnotifyPosition.rightTop,
        });
        this._cargarAsignaciones();
      },
    });
  }

  private _cargarAsignaciones(): void {
    if (!this.modelo.ruta) {
      this.asignaciones = [];
      return;
    }
    this.cargandoAsignaciones = true;
    this._rutaClienteApiService.getAllRutaCliente(this.modelo.ruta).subscribe({
      next: (result) => {
        this.cargandoAsignaciones = false;
        this.asignaciones = result;
      },
      error: () => {
        this.cargandoAsignaciones = false;
        this._snotifyService.error(
          "No fue posible consultar los días asignados de la ruta",
          { position: SnotifyPosition.rightTop }
        );
      },
    });
  }

  abrirPickerRuta(): void {
    if (!this.esNuevo) return;
    this._rutaApiService.getRutas().subscribe({
      next: (response) => {
        if (!response.success) {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
          return;
        }
        const items: IF1Item[] = response.result.map((r) => ({
          codigo: r.RUTA,
          nombre: r.DESCRIPCION,
        }));
        this._abrirF1("Seleccionar Ruta", items, (seleccion) => {
          this.modelo.ruta = seleccion.codigo;
          this.modelo.descripcion = seleccion.nombre;
          this._cargarAsignaciones();
        });
      },
    });
  }

  abrirPickerGrupoArticulo(): void {
    this._grupoArticuloApiService.getGruposArticulo().subscribe({
      next: (response) => {
        if (!response.success) {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
          return;
        }
        const items: IF1Item[] = response.result.map((g) => ({
          codigo: g.GRUPO_ARTICULO,
          nombre: g.DESCRIPCION,
        }));
        this._abrirF1("Seleccionar Grupo de Artículo", items, (seleccion) => {
          this.modelo.grupoArticulo = seleccion.codigo;
          this.modelo.grupoArticuloNombre = seleccion.nombre;
        });
      },
    });
  }

  abrirPickerCompania(): void {
    this._abrirF1(
      "Seleccionar Compañía",
      COMPANIAS_DISPONIBLES,
      (seleccion) => {
        this.modelo.compania = seleccion.codigo;
        this.modelo.companiaNombre = seleccion.nombre;
      }
    );
  }

  abrirPickerHandheld(): void {
    this._handheldApiService.getHandhelds().subscribe({
      next: (response) => {
        if (!response.success) {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
          return;
        }
        const items: IF1Item[] = response.result.map((h) => ({
          codigo: h.HANDHELD,
          nombre: h.DESCRIPCION,
        }));
        this._abrirF1("Seleccionar HandHeld", items, (seleccion) => {
          this.modelo.handheld = seleccion.codigo;
          this.modelo.handheldNombre = seleccion.nombre;
        });
      },
    });
  }

  abrirPickerAgente(): void {
    this._vendedorErpApiService.getVendedoresErp("", 1, 100).subscribe({
      next: (response) => {
        if (!response.success) {
          this._snotifyService.error(
            response.errors?.[0] ?? "Error al consultar los vendedores",
            { position: SnotifyPosition.rightTop }
          );
          return;
        }
        const items: IF1Item[] = response.result.map((v) => ({
          codigo: v.VENDEDOR,
          nombre: v.NOMBRE,
        }));
        this._abrirF1("Seleccionar Agente", items, (seleccion) => {
          this.modelo.agente = seleccion.codigo;
          this.modelo.agenteNombre = seleccion.nombre;
        });
      },
    });
  }

  abrirPickerBodega(): void {
    this._bodegaAsocRtApiService.getBodegasConNombre().subscribe({
      next: (response) => {
        if (!response.success) {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
          return;
        }
        const items: IF1Item[] = response.result.map((b) => ({
          codigo: b.CODIGO,
          nombre: b.NOMBRE,
        }));
        this._abrirF1("Seleccionar Camión / Bodega", items, (seleccion) => {
          this.modelo.bodega = seleccion.codigo;
          this.modelo.bodegaNombre = seleccion.nombre;
        });
      },
    });
  }

  private _abrirF1(
    titulo: string,
    items: IF1Item[],
    onSeleccionar: (item: IF1Item) => void
  ): void {
    this._dialog
      .open(F1SelectorComponent, { width: "40%", data: { titulo, items } })
      .afterClosed()
      .subscribe((seleccion: IF1Item) => {
        if (seleccion) onSeleccionar(seleccion);
      });
  }

  guardar(): void {
    if (!this.modelo.ruta) {
      this._snotifyService.warning("Debe seleccionar una ruta", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    this._dialogRef.close(this.modelo);
  }
}
