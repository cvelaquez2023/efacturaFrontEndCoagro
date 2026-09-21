import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { AddRutaComponent } from "../add-ruta/add-ruta.component";
import { RutaApiService } from "../../service/ruta-api.service";
import { IResponseRuta } from "../../model/ruta-fr-model-interface";

@Component({
  selector: "app-rutas-page",
  templateUrl: "./rutas-page.component.html",
  styleUrls: ["./rutas-page.component.scss"],
})
export class RutasPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _rutaApiService: RutaApiService
  ) {}

  listRutas = new MatTableDataSource<IResponseRuta>();
  displayedColumns: string[] = [
    "ruta",
    "descripcion",
    "activa",
    "periodicidad",
    "actions",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadRutas();
  }

  // Manual FRd: "Para agregar la información de una ruta nueva se debe utilizar el botón o la
  // combinación de teclas Ctrl + N".
  @HostListener("document:keydown.control.n", ["$event"])
  atajoNuevaRuta(event: KeyboardEvent): void {
    event.preventDefault();
    this.openDialog();
  }

  ngAfterViewInit(): void {
    this.listRutas.paginator = this.paginator;
    this.listRutas.sort = this.sort;
  }

  private _loadRutas(): void {
    this._rutaApiService.getRutas().subscribe({
      next: (response) => {
        if (response.success) {
          this.listRutas.data = response.result;
        } else {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listRutas.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this._dialog
      .open(AddRutaComponent, { width: "90vw", maxWidth: "1100px" })
      .afterClosed()
      .subscribe((val) => {
        if (val === "save") {
          this._loadRutas();
        }
      });
  }

  clickEdit(element: IResponseRuta): void {
    this._dialog
      .open(AddRutaComponent, {
        width: "90vw",
        maxWidth: "1100px",
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadRutas();
        }
      });
  }

  clickDelete(ruta: string): void {
    this._snotifyService.confirm("¿Está seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._rutaApiService.deleteRuta(ruta).subscribe((response) => {
              if (response.success) {
                this._snotifyService.info("El registro ha sido eliminado");
                this._loadRutas();
              } else {
                this._snotifyService.error(response.errors[0], {
                  position: SnotifyPosition.rightTop,
                });
              }
            });
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }
}
