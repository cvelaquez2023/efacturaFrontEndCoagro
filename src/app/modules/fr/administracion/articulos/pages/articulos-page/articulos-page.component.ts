import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { EMPTY, Observable, forkJoin } from "rxjs";
import { expand, reduce } from "rxjs/operators";
import { GrupoArticuloApiService } from "@app/modules/fr/administracion/grupos-articulos/service/grupo-articulo-api.service";
import { AddArticuloFrComponent } from "../add-articulo-fr/add-articulo-fr.component";
import { ArticuloFrApiService } from "../../service/articulo-fr-api.service";
import { IResponseArticuloFr } from "../../model/articulo-fr-model-interface";

@Component({
  selector: "app-articulos-page",
  templateUrl: "./articulos-page.component.html",
  styleUrls: ["./articulos-page.component.scss"],
})
export class ArticulosPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _articuloFrApiService: ArticuloFrApiService,
    private _grupoArticuloApiService: GrupoArticuloApiService
  ) {}

  listArticulos = new MatTableDataSource<IResponseArticuloFr>();
  displayedColumns: string[] = [
    "codigo",
    "descripcion",
    "bodega",
    "grupoArticulo",
    "actions",
  ];
  /** Codigo de articulo -> "GRUPO - Descripcion" del grupo al que esta asociado. */
  grupoPorArticulo = new Map<string, string>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadArticulos();
  }

  ngAfterViewInit(): void {
    this.listArticulos.paginator = this.paginator;
    this.listArticulos.sort = this.sort;
  }

  private _loadArticulos(): void {
    forkJoin({
      articulos: this._cargarTodosLosArticulos(),
      asociaciones: this._grupoArticuloApiService.getAllAsociaciones(),
      grupos: this._grupoArticuloApiService.getGruposArticulo(),
    }).subscribe(({ articulos, asociaciones, grupos }) => {
      const descripcionPorGrupo = new Map(
        (grupos.success ? grupos.result : []).map(
          (g) => [g.GRUPO_ARTICULO, g.DESCRIPCION] as [string, string]
        )
      );
      this.grupoPorArticulo = new Map(
        asociaciones.map(
          (a) =>
            [
              a.ARTICULO,
              `${a.GRUPO_ARTICULO} - ${
                descripcionPorGrupo.get(a.GRUPO_ARTICULO) ?? ""
              }`,
            ] as [string, string]
        )
      );
      this.listArticulos.data = articulos;
    });
  }

  /** Recorre todas las paginas de articuloRt (limite maximo del backend: 100 por pagina). */
  private _cargarTodosLosArticulos(): Observable<IResponseArticuloFr[]> {
    return this._articuloFrApiService.getArticulos(1, 100).pipe(
      expand((response) =>
        response.success &&
        response.pagination.page < response.pagination.totalPages
          ? this._articuloFrApiService.getArticulos(
              response.pagination.page + 1,
              100
            )
          : EMPTY
      ),
      reduce(
        (acumulado: IResponseArticuloFr[], response) =>
          response.success ? acumulado.concat(response.result) : acumulado,
        [] as IResponseArticuloFr[]
      )
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listArticulos.filter = filterValue.trim().toLowerCase();
  }

  clickEdit(element: IResponseArticuloFr): void {
    this._dialog
      .open(AddArticuloFrComponent, { width: "40%", data: element })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadArticulos();
        }
      });
  }
}
