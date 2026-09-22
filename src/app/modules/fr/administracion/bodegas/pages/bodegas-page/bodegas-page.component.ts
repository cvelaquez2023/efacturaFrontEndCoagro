import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { AddBodegaComponent } from "../add-bodega/add-bodega.component";
import { BodegaAsocRtApiService } from "../../service/bodega-asoc-rt-api.service";
import { BodegaFrApiService } from "../../service/bodega-fr-api.service";
import { IResponseBodegaConAsoc } from "../../model/bodega-fr-model-interface";

@Component({
  selector: "app-bodegas-page",
  templateUrl: "./bodegas-page.component.html",
  styleUrls: ["./bodegas-page.component.scss"],
})
export class BodegasPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _bodegaAsocRtApiService: BodegaAsocRtApiService,
    private _bodegaFrApiService: BodegaFrApiService
  ) {}

  listBodegas = new MatTableDataSource<IResponseBodegaConAsoc>();
  displayedColumns: string[] = ["codigo", "nombre", "vinculoErp", "actions"];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadBodegas();
  }

  ngAfterViewInit(): void {
    this.listBodegas.paginator = this.paginator;
    this.listBodegas.sort = this.sort;
  }

  private _loadBodegas(): void {
    this._bodegaAsocRtApiService.getBodegasConNombre().subscribe({
      next: (response) => {
        if (response.success) {
          this.listBodegas.data = response.result;
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
    this.listBodegas.filter = filterValue.trim().toLowerCase();
  }

  esCargaDirecta(element: IResponseBodegaConAsoc): boolean {
    return !!element.BODEGA_ERP && element.BODEGA_ERP === element.BODEGA;
  }

  openDialog(): void {
    this._dialog
      .open(AddBodegaComponent, { width: "40%" })
      .afterClosed()
      .subscribe((val) => {
        if (val === "save") {
          this._loadBodegas();
        }
      });
  }

  clickEdit(element: IResponseBodegaConAsoc): void {
    this._dialog
      .open(AddBodegaComponent, { width: "40%", data: element })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadBodegas();
        }
      });
  }

  clickDelete(element: IResponseBodegaConAsoc): void {
    this._snotifyService.confirm("¿Está seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._bodegaFrApiService
              .deleteBodega(element.BODEGA)
              .subscribe((response) => {
                if (response.success) {
                  this._snotifyService.info("El registro ha sido eliminado");
                  this._loadBodegas();
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
