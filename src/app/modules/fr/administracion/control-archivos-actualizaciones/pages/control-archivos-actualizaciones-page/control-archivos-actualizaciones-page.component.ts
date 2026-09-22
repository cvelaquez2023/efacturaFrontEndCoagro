import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { AddActualizacionComponent } from "../add-actualizacion/add-actualizacion.component";
import { IActualizacionFr } from "../../model/actualizacion-fr-model-interface";

// Pantalla solo visual (manual pag. 132): no existe endpoint real.
const MOCK_ACTUALIZACIONES: IActualizacionFr[] = [
  {
    nombre: "ReporteFacturaSV_v3",
    tipo: "Reporte",
    fecha: "2026-07-20",
    handhelds: "HH01, HH02, HH03",
    publicada: true,
  },
  {
    nombre: "FR_Mobile_Setup_7.01",
    tipo: "Paquete",
    fecha: "2026-08-01",
    handhelds: "HH01, HH02",
    publicada: false,
  },
];

@Component({
  selector: "app-control-archivos-actualizaciones-page",
  templateUrl: "./control-archivos-actualizaciones-page.component.html",
  styleUrls: ["./control-archivos-actualizaciones-page.component.scss"],
})
export class ControlArchivosActualizacionesPageComponent
  implements OnInit, AfterViewInit
{
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog
  ) {}

  listActualizaciones = new MatTableDataSource<IActualizacionFr>();
  displayedColumns: string[] = [
    "nombre",
    "tipo",
    "fecha",
    "handhelds",
    "publicada",
    "actions",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _data: IActualizacionFr[] = [...MOCK_ACTUALIZACIONES];

  ngOnInit(): void {
    this.listActualizaciones.data = this._data;
  }

  ngAfterViewInit(): void {
    this.listActualizaciones.paginator = this.paginator;
    this.listActualizaciones.sort = this.sort;
  }

  openDialog(): void {
    this._dialog
      .open(AddActualizacionComponent, { width: "40%" })
      .afterClosed()
      .subscribe((result: IActualizacionFr) => {
        if (result) {
          this._data = [...this._data, result];
          this.listActualizaciones.data = this._data;
          this._snotifyService.info("La actualizacion se creo sin problema", {
            position: SnotifyPosition.rightTop,
          });
        }
      });
  }

  publicar(element: IActualizacionFr): void {
    this._data = this._data.map((item) =>
      item.nombre === element.nombre ? { ...item, publicada: true } : item
    );
    this.listActualizaciones.data = this._data;
    this._snotifyService.info("La actualizacion ha sido publicada", {
      position: SnotifyPosition.rightTop,
    });
  }
}
