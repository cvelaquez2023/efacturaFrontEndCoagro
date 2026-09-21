import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { forkJoin } from "rxjs";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { MantenimientoAsignacionRutaComponent } from "../mantenimiento-asignacion-ruta/mantenimiento-asignacion-ruta.component";
import { RutaAsignadaApiService } from "../../service/ruta-asignada-api.service";
import { RutaApiService } from "../../../rutas/service/ruta-api.service";
import { IResponseRuta } from "../../../rutas/model/ruta-fr-model-interface";
import {
  ICreateRutaAsignadaModel,
  IAsignacionRutaFr,
  IResponseRutaAsignada,
} from "../../model/asignacion-ruta-model-interface";

@Component({
  selector: "app-asignacion-rutas-page",
  templateUrl: "./asignacion-rutas-page.component.html",
  styleUrls: ["./asignacion-rutas-page.component.scss"],
})
export class AsignacionRutasPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _rutaAsignadaApiService: RutaAsignadaApiService,
    private _rutaApiService: RutaApiService
  ) {}

  listAsignaciones = new MatTableDataSource<IAsignacionRutaFr>();
  displayedColumns: string[] = ["ruta", "descripcion", "activa", "actions"];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _data: IAsignacionRutaFr[] = [];

  ngOnInit(): void {
    this._cargarAsignaciones();
  }

  ngAfterViewInit(): void {
    this.listAsignaciones.paginator = this.paginator;
    this.listAsignaciones.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listAsignaciones.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this._dialog
      .open(MantenimientoAsignacionRutaComponent, {
        width: "90vw",
        maxWidth: "1100px",
      })
      .afterClosed()
      .subscribe((result: IAsignacionRutaFr) => {
        if (!result) return;
        this._rutaAsignadaApiService
          .createRutaAsignada(this._aModeloBackend(result))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this._snotifyService.info(
                  "La asignación de la ruta se guardó sin problema",
                  { position: SnotifyPosition.rightTop }
                );
                this._cargarAsignaciones();
              } else {
                this._snotifyService.error(response.errors[0], {
                  position: SnotifyPosition.rightTop,
                });
              }
            },
            error: () =>
              this._snotifyService.error(
                "No fue posible guardar la asignación de la ruta",
                { position: SnotifyPosition.rightTop }
              ),
          });
      });
  }

  clickMantenimiento(element: IAsignacionRutaFr): void {
    this._dialog
      .open(MantenimientoAsignacionRutaComponent, {
        width: "90vw",
        maxWidth: "1100px",
        data: element,
      })
      .afterClosed()
      .subscribe((result: IAsignacionRutaFr) => {
        if (!result) return;
        const { ruta, ...datos } = this._aModeloBackend(result);
        this._rutaAsignadaApiService
          .updateRutaAsignada(element.ruta, datos)
          .subscribe({
            next: (response) => {
              if (response.success) {
                this._snotifyService.info(
                  "La asignación de la ruta se actualizó sin problema",
                  { position: SnotifyPosition.rightTop }
                );
                this._cargarAsignaciones();
              } else {
                this._snotifyService.error(response.errors[0], {
                  position: SnotifyPosition.rightTop,
                });
              }
            },
            error: () =>
              this._snotifyService.error(
                "No fue posible actualizar la asignación de la ruta",
                { position: SnotifyPosition.rightTop }
              ),
          });
      });
  }

  clickEliminar(element: IAsignacionRutaFr): void {
    this._snotifyService.confirm(
      `¿Eliminar la asignación de la ruta ${element.ruta}?`,
      {
        position: SnotifyPosition.rightTop,
        buttons: [
          {
            text: "SI",
            bold: true,
            action: (toast) => {
              this._snotifyService.remove(toast.id);
              this._rutaAsignadaApiService
                .deleteRutaAsignada(element.ruta)
                .subscribe({
                  next: (response) => {
                    if (response.success) {
                      this._snotifyService.info(
                        "La asignación de la ruta se eliminó sin problema",
                        { position: SnotifyPosition.rightTop }
                      );
                      this._data = this._data.filter(
                        (item) => item.ruta !== element.ruta
                      );
                      this.listAsignaciones.data = this._data;
                    } else {
                      this._snotifyService.error(response.errors[0], {
                        position: SnotifyPosition.rightTop,
                      });
                    }
                  },
                  error: () =>
                    this._snotifyService.error(
                      "No fue posible eliminar la asignación de la ruta",
                      { position: SnotifyPosition.rightTop }
                    ),
                });
            },
          },
          { text: "CANCELAR" },
        ],
      }
    );
  }

  private _cargarAsignaciones(): void {
    forkJoin([
      this._rutaAsignadaApiService.getRutasAsignadas(),
      this._rutaApiService.getRutas(),
    ]).subscribe({
      next: ([asignadas, rutas]) => {
        if (!asignadas.success) {
          this._snotifyService.error(asignadas.errors[0], {
            position: SnotifyPosition.rightTop,
          });
          return;
        }
        const porRuta = new Map(
          (rutas.success ? rutas.result : []).map((r) => [r.RUTA, r])
        );
        this._data = asignadas.result.map((a) =>
          this._aFila(a, porRuta.get(a.RUTA))
        );
        this.listAsignaciones.data = this._data;
      },
      error: () =>
        this._snotifyService.error(
          "No fue posible consultar las asignaciones de ruta",
          { position: SnotifyPosition.rightTop }
        ),
    });
  }

  private _aFila(
    asignacion: IResponseRutaAsignada,
    ruta?: IResponseRuta
  ): IAsignacionRutaFr {
    return {
      ruta: asignacion.RUTA,
      descripcion: ruta?.DESCRIPCION ?? "",
      compania: asignacion.COMPANIA ?? "",
      activa: asignacion.ACTIVA === "S",
      grupoArticulo: asignacion.GRUPO_ARTICULO,
      agente: asignacion.AGENTE,
      handheld: asignacion.HANDHELD,
      bodega: asignacion.BODEGA,
    };
  }

  private _aModeloBackend(modelo: IAsignacionRutaFr): ICreateRutaAsignadaModel {
    return {
      ruta: modelo.ruta,
      agente: modelo.agente,
      handheld: modelo.handheld,
      grupoArticulo: modelo.grupoArticulo,
      bodega: modelo.bodega,
      activa: modelo.activa ? "S" : "N",
    };
  }
}
