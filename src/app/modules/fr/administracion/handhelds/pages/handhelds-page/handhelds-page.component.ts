import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { AddHandheldComponent } from "../add-handheld/add-handheld.component";
import { HandheldApiService } from "../../service/handheld-api.service";
import { IResponseHandheld } from "../../model/handheld-fr-model-interface";

@Component({
  selector: "app-handhelds-page",
  templateUrl: "./handhelds-page.component.html",
  styleUrls: ["./handhelds-page.component.scss"],
})
export class HandheldsPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _handheldApiService: HandheldApiService
  ) {}

  listHandhelds = new MatTableDataSource<IResponseHandheld>();
  displayedColumns: string[] = [
    "codigo",
    "descripcion",
    "modelo",
    "serie",
    "estado",
    "actions",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadHandhelds();
  }

  ngAfterViewInit(): void {
    this.listHandhelds.paginator = this.paginator;
    this.listHandhelds.sort = this.sort;
  }

  private _loadHandhelds(): void {
    this._handheldApiService.getHandhelds().subscribe({
      next: (response) => {
        if (response.success) {
          this.listHandhelds.data = response.result;
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
    this.listHandhelds.filter = filterValue.trim().toLowerCase();
  }

  openDialog(): void {
    this._dialog
      .open(AddHandheldComponent, { width: "40%" })
      .afterClosed()
      .subscribe((val) => {
        if (val === "save") {
          this._loadHandhelds();
        }
      });
  }

  clickEdit(element: IResponseHandheld): void {
    this._dialog
      .open(AddHandheldComponent, { width: "40%", data: element })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadHandhelds();
        }
      });
  }

  clickDelete(handheld: string): void {
    this._snotifyService.confirm("¿Está seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._handheldApiService
              .deleteHandheld(handheld)
              .subscribe((response) => {
                if (response.success) {
                  this._snotifyService.info("El registro ha sido eliminado");
                  this._loadHandhelds();
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
