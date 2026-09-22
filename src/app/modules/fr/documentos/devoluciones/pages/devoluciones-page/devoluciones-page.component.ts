import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { DefinirLoteDevolucionComponent } from "../definir-lote-devolucion/definir-lote-devolucion.component";
import { IDevolucionFr } from "../../model/devolucion-fr-model-interface";

// Pantalla solo visual: refleja "Devoluciones Pendientes de Carga" del manual (pag. 72),
// no existe endpoint real en el backend para este catalogo.
const MOCK_DEVOLUCIONES: IDevolucionFr[] = [
  {
    codigo: "DEV0001",
    compania: "COAGRO2",
    ruta: "R001",
    cliente: "CL001",
    bodega: "BODV",
    documentoReferencia: "FAC0045",
    estado: "Nuevo",
    anulada: false,
    cantidadLineas: 3,
    fecha: "2026-08-05",
    lote: "",
  },
  {
    codigo: "DEV0002",
    compania: "COAGRO2",
    ruta: "R002",
    cliente: "CL003",
    bodega: "BODV",
    documentoReferencia: "FAC0051",
    estado: "Nuevo",
    anulada: false,
    cantidadLineas: 1,
    fecha: "2026-08-06",
    lote: "",
  },
  {
    codigo: "DEV0003",
    compania: "COAGRO2",
    ruta: "R001",
    cliente: "CL002",
    bodega: "BODV",
    documentoReferencia: "",
    estado: "Nuevo",
    anulada: false,
    cantidadLineas: 2,
    fecha: "2026-08-07",
    lote: "",
  },
];

@Component({
  selector: "app-devoluciones-page",
  templateUrl: "./devoluciones-page.component.html",
  styleUrls: ["./devoluciones-page.component.scss"],
})
export class DevolucionesPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog
  ) {}

  listDevoluciones = new MatTableDataSource<IDevolucionFr>();
  displayedColumns: string[] = [
    "codigo",
    "ruta",
    "cliente",
    "documentoReferencia",
    "cantidadLineas",
    "fecha",
    "lote",
    "actions",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _data: IDevolucionFr[] = [...MOCK_DEVOLUCIONES];

  ngOnInit(): void {
    this.listDevoluciones.data = this._data;
  }

  ngAfterViewInit(): void {
    this.listDevoluciones.paginator = this.paginator;
    this.listDevoluciones.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listDevoluciones.filter = filterValue.trim().toLowerCase();
  }

  clickEdit(element: IDevolucionFr): void {
    this._dialog
      .open(DefinirLoteDevolucionComponent, { width: "45%", data: element })
      .afterClosed()
      .subscribe((result: IDevolucionFr) => {
        if (result) {
          this._data = this._data.map((item) =>
            item.codigo === element.codigo ? result : item
          );
          this.listDevoluciones.data = this._data;
          this._snotifyService.info("El lote se registro sin problema", {
            position: SnotifyPosition.rightTop,
          });
        }
      });
  }
}
