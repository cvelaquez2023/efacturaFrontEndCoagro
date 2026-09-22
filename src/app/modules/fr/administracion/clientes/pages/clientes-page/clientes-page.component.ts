import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { AddClienteFrComponent } from "../add-cliente-fr/add-cliente-fr.component";
import { ClienteAsocRtApiService } from "../../service/cliente-asoc-rt-api.service";
import { IResponseClienteConAsoc } from "../../model/cliente-fr-model-interface";

@Component({
  selector: "app-clientes-page",
  templateUrl: "./clientes-page.component.html",
  styleUrls: ["./clientes-page.component.scss"],
})
export class ClientesPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _clienteAsocRtApiService: ClienteAsocRtApiService
  ) {}

  listClientes = new MatTableDataSource<IResponseClienteConAsoc>();
  displayedColumns: string[] = ["codigo", "nombre", "actions"];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadClientes();
  }

  ngAfterViewInit(): void {
    this.listClientes.paginator = this.paginator;
    this.listClientes.sort = this.sort;
  }

  private _loadClientes(): void {
    this._clienteAsocRtApiService.getClientesConNombre().subscribe({
      next: (response) => {
        if (response.success) {
          this.listClientes.data = response.result;
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
    this.listClientes.filter = filterValue.trim().toLowerCase();
  }

  clickEdit(element: IResponseClienteConAsoc): void {
    this._dialog
      .open(AddClienteFrComponent, { width: "40%", data: element })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadClientes();
        }
      });
  }
}
