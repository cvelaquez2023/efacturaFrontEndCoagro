import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { VisitaApiService } from "../../service/visita-api.service";
import { IResponseVisita } from "../../model/visita-api-model-interface";
import { AddVisitaComponent } from "../add-visita/add-visita.component";

@Component({
  selector: "app-visitas-page",
  templateUrl: "./visitas-page.component.html",
  styleUrls: ["./visitas-page.component.scss"],
})
export class VisitasPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _visitaApiService: VisitaApiService
  ) {}

  listVisitas = new MatTableDataSource<IResponseVisita>();
  displayedColumns: string[] = [
    "RUTA",
    "CLIENTE",
    "INICIO",
    "RAZON",
    "TIPO",
    "actions",
  ];
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadVisitas();
  }

  ngAfterViewInit(): void {
    this.listVisitas.paginator = this.paginator;
    this.listVisitas.sort = this.sort;
  }

  private _loadVisitas(): void {
    this._visitaApiService.getVisitas().subscribe({
      next: (response) => {
        if (response.success) {
          this.listVisitas.data = response.result;
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
    this.listVisitas.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this._dialog
      .open(AddVisitaComponent, {
        width: "40%",
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "save") {
          this._loadVisitas();
        }
      });
  }

  clickEdit(element: IResponseVisita): void {
    this._dialog
      .open(AddVisitaComponent, {
        width: "40%",
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadVisitas();
        }
      });
  }

  clickDelete(element: IResponseVisita): void {
    this._snotifyService.confirm("¿Está seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._visitaApiService
              .deleteVisita(element.RUTA, element.CLIENTE, element.INICIO)
              .subscribe((response) => {
                if (response.success) {
                  this._snotifyService.info("El registro ha sido eliminado");
                  this._loadVisitas();
                } else {
                  this._snotifyService.error(response.errors[0], {
                    position: SnotifyPosition.rightTop,
                  });
                }
              });
          },
        },
        {
          text: "CANCELAR",
        },
      ],
    });
  }
}
