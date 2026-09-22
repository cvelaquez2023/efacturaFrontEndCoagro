/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { IResponseUsuario } from "@app/modules/as/seguridad/usuario/service/usuario-api-model-interface";
import { IResponseListarUsuario } from "@app/modules/auth/services/api/user-api-model-interface";
import { UserApiService } from "@app/modules/auth/services/api/user-api.service";
import { SnotifyService } from "ng-snotify";
import { CrearUsuarioComponent } from "../crear-usuario/crear-usuario.component";

@Component({
  selector: "app-lista-usuarios-pages",
  templateUrl: "./lista-usuarios-pages.component.html",
  styleUrls: ["./lista-usuarios-pages.component.scss"],
})
export class ListaUsuariosPagesComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _AuthApiService: UserApiService
  ) {}
  listUsuarios = new MatTableDataSource<IResponseListarUsuario>();
  displayedColumns: string[] = ["email", "nombres", "rol", "activo", "actions"];
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchkey!: "carlos";
  ngOnInit(): void {
    this._loadUser();
  }
  ngAfterViewInit(): void {
    this.listUsuarios.paginator = this.paginator;
    this.listUsuarios.sort = this.sort;
  }
  openDialog(): void {
    this._dialog
      .open(CrearUsuarioComponent, {
        width: "30%",
      })
      .afterClosed()
      .subscribe((val) => {
        if (val == "save") {
          this._loadUser();
        }
      });
  }
  private _loadUser(): void {
    this._AuthApiService.getListarUsuario().subscribe({
      next: (response) => {
        this.listUsuarios.data = response.result;
      },
    });
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listUsuarios.filter = filterValue.trim().toLowerCase();
  }
  clickDelete(usuario_id: number): void {
    console.log(usuario_id);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  clickEdit(element: any): void {
    this._dialog
      .open(CrearUsuarioComponent, {
        width: "30%",
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val == "edit") {
          this._loadUser();
        }
      });
  }
}
