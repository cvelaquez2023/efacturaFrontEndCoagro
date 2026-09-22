import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { RazonVisitaApiService } from "../../service/razon-visita-api.service";
import { IResponseRazonVisita } from "../../model/razon-visita-api-model-interface";
import { AddRazonVisitaComponent } from "../add-razon-visita/add-razon-visita.component";

@Component({
  selector: "app-razones-visita-page",
  templateUrl: "./razones-visita-page.component.html",
  styleUrls: ["./razones-visita-page.component.scss"],
})
export class RazonesVisitaPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _razonVisitaApiService: RazonVisitaApiService
  ) {}

  listRazonVisita = new MatTableDataSource<IResponseRazonVisita>();
  displayedColumns: string[] = ["codigo", "descripcion", "actions"];
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadRazonVisita();
  }

  ngAfterViewInit(): void {
    this.listRazonVisita.paginator = this.paginator;
    this.listRazonVisita.sort = this.sort;
  }

  private _loadRazonVisita(): void {
    this._razonVisitaApiService.getRazonVisita().subscribe({
      next: (response) => {
        if (response.success) {
          this.listRazonVisita.data = response.result;
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
    this.listRazonVisita.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this._dialog
      .open(AddRazonVisitaComponent, {
        width: "30%",
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "save") {
          this._loadRazonVisita();
        }
      });
  }

  clickEdit(element: IResponseRazonVisita): void {
    this._dialog
      .open(AddRazonVisitaComponent, {
        width: "30%",
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadRazonVisita();
        }
      });
  }

  clickDelete(efectVisita: string): void {
    this._snotifyService.confirm("¿Está seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._razonVisitaApiService
              .deleteRazonVisita(efectVisita)
              .subscribe((response) => {
                if (response.success) {
                  this._snotifyService.info("El registro ha sido eliminado");
                  this._loadRazonVisita();
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
