import { ViewChild } from "@angular/core";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ClienteDteApiService } from "../../service/cliente-dte-api.service";
import { MatTableDataSource } from "@angular/material/table";
import { IResponseDteObser } from "@app/modules/ci/articulo/model/articulo-api-model-interface";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";

@Component({
  selector: "app-lista-observaciones",
  templateUrl: "./lista-observaciones.component.html",
  styleUrls: ["./lista-observaciones.component.scss"],
})
export class ListaObservacionesComponent {
  constructor(
    private _dteApiService: ClienteDteApiService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public ediData: any,
    private _dialogRef: MatDialogRef<ListaObservacionesComponent>
  ) {
    this._loadDoc();
  }
  listCobradores = new MatTableDataSource<IResponseDteObser>();
  displayedColumns: string[] = ["Descripcion"];
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchKey!: "carlos";

  private _loadDoc(): void {
    this._dteApiService
      .getDteObservaciones(this.ediData.Dte_Id as number)
      .subscribe({
        next: (response) => {
          this.listCobradores.data = response.result;
        },
        error: (error) => {
          console.log("er", error);
        },
      });
  }
}
