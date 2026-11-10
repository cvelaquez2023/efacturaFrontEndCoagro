import { Component, OnInit } from "@angular/core";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { finalize } from "rxjs/operators";
import { CargaFrApiService } from "../../../shared/carga-fr-api.service";
import { IEjecucionCarga } from "../../../shared/carga-fr-model-interface";

// Carga de Datos a HandHeld (manual pág. 119). Real: POST /fr/carga/movil ->
// erpadmin.CargaAlMovil (sin parámetros). Regenera desde el ERP las tablas que bajan las
// handhelds en su próxima sincronización.
@Component({
  selector: "app-carga-handheld-page",
  templateUrl: "./carga-handheld-page.component.html",
  styleUrls: ["./carga-handheld-page.component.scss"],
})
export class CargaHandheldPageComponent implements OnInit {
  /** Lo que prepara el procedimiento CargaAlMovil, en el orden en que lo hace. */
  readonly datosCargados: string[] = [
    "Visitas planificadas de las rutas activas",
    "Clientes de las rutas y sus condiciones",
    "Descuentos y datos fiscales de clientes",
    "Artículos y grupos de artículos",
    "Existencias por bodega y por lote",
    "Precios por nivel de precio",
    "Departamentos y municipios",
    "Niveles de precio y subtipos de documento",
    "Orden de visita por ruta",
    "Documentos pendientes de cobro",
    "Historial de pedidos y facturas",
  ];

  ejecutando = false;
  ultimaEjecucion: IEjecucionCarga | null = null;
  ejecuciones: IEjecucionCarga[] = [];
  ejecucionesColumns = ["inicio", "estado", "duracion", "mensaje"];

  constructor(
    private _cargaApi: CargaFrApiService,
    private _snotifyService: SnotifyService
  ) {}

  ngOnInit(): void {
    this.ejecuciones = this._cargaApi.ejecuciones("HANDHELD");
    this.ultimaEjecucion = this.ejecuciones[0] ?? null;
  }

  confirmarCarga(): void {
    if (this.ejecutando) return;
    this._snotifyService.confirm(
      "Se regenerarán todos los datos que bajan las handhelds. ¿Desea continuar?",
      {
        position: SnotifyPosition.rightTop,
        buttons: [
          {
            text: "SI",
            bold: true,
            action: (toast) => {
              this._snotifyService.remove(toast.id);
              this._ejecutar();
            },
          },
          { text: "CANCELAR" },
        ],
      }
    );
  }

  private _ejecutar(): void {
    const inicio = new Date();
    this.ejecutando = true;
    this._cargaApi
      .cargaAlMovil()
      .pipe(finalize(() => (this.ejecutando = false)))
      .subscribe({
        next: (resp) => {
          const ok = !!resp.success;
          const msg = ok
            ? "Datos listos para sincronizar en las handhelds"
            : resp.errors?.[0] || "Error al ejecutar la carga al móvil";
          this._registrar(inicio, ok, msg);
          if (ok) {
            this._snotifyService.success("La carga hacia las HandHelds finalizó correctamente", {
              position: SnotifyPosition.rightTop,
            });
          } else {
            this._snotifyService.error(msg, { position: SnotifyPosition.rightTop });
          }
        },
        error: () => {
          const msg = "No se pudo conectar con el servidor";
          this._registrar(inicio, false, msg);
          this._snotifyService.error(msg, { position: SnotifyPosition.rightTop });
        },
      });
  }

  private _registrar(inicio: Date, exito: boolean, mensaje: string): void {
    this._cargaApi.registrarEjecucion({
      tipo: "HANDHELD",
      inicio,
      duracionSeg: (Date.now() - inicio.getTime()) / 1000,
      exito,
      mensaje,
    });
    this.ejecuciones = this._cargaApi.ejecuciones("HANDHELD");
    this.ultimaEjecucion = this.ejecuciones[0] ?? null;
  }
}
