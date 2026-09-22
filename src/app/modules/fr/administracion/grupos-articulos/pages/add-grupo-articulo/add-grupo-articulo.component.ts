import { AfterViewInit, Component, Inject, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin } from "rxjs";
import { GrupoArticuloApiService } from "../../service/grupo-articulo-api.service";
import {
  ICreateGrupoArticuloModel,
  IResponseArticuloRt,
  IResponseGrupoArticulo,
} from "../../model/grupo-articulo-fr-model-interface";

@Component({
  selector: "app-add-grupo-articulo",
  templateUrl: "./add-grupo-articulo.component.html",
  styleUrls: ["./add-grupo-articulo.component.scss"],
})
export class AddGrupoArticuloComponent implements AfterViewInit {
  grupoForm!: FormGroup;
  actionBtn = "Guardar";

  /** Solo lectura: artículos ya asociados al grupo. La asociación se hace desde Cargar Artículos. */
  articulosColumns: string[] = ["articulo", "descripcion"];
  articulosDataSource = new MatTableDataSource<IResponseArticuloRt>();
  cargandoArticulos = false;
  guardando = false;

  @ViewChild(MatPaginator) private _articulosPaginator!: MatPaginator;

  constructor(
    private _formBuilder: FormBuilder,
    private _grupoArticuloApiService: GrupoArticuloApiService,
    private _snotifyService: SnotifyService,
    @Inject(MAT_DIALOG_DATA) public ediData: IResponseGrupoArticulo,
    private _dialogRef: MatDialogRef<AddGrupoArticuloComponent>
  ) {
    this._loadFormGroup();
    this._loadArticulosAsociados();
  }

  ngAfterViewInit(): void {
    this.articulosDataSource.paginator = this._articulosPaginator;
  }

  private _loadFormGroup(): void {
    this.grupoForm = this._formBuilder.group({
      grupoArticulo: ["", [Validators.required, Validators.maxLength(3)]],
      descripcion: ["", [Validators.required, Validators.maxLength(40)]],
    });
    if (this.ediData) {
      this.actionBtn = "Editar";
      this.grupoForm.controls["grupoArticulo"].setValue(
        this.ediData.GRUPO_ARTICULO
      );
      this.grupoForm.controls["grupoArticulo"].disable();
      this.grupoForm.controls["descripcion"].setValue(this.ediData.DESCRIPCION);
    }
  }

  /** Muestra únicamente los artículos ya asociados a este grupo (ARTICULO_RT filtrado por GRUPO_ART_ASOC_RT). */
  private _loadArticulosAsociados(): void {
    if (!this.ediData) {
      this.articulosDataSource.data = [];
      return;
    }
    this.cargandoArticulos = true;
    forkJoin({
      articulos: this._grupoArticuloApiService.getAllArticulosRt(),
      vinculados: this._grupoArticuloApiService.getAllArticulosAsociados(
        this.ediData.GRUPO_ARTICULO
      ),
    }).subscribe({
      next: ({ articulos, vinculados }) => {
        const codigosVinculados = new Set(vinculados.map((v) => v.ARTICULO));
        this.articulosDataSource.data = articulos
          .filter((a) => codigosVinculados.has(a.ARTICULO))
          .sort((a, b) => a.ARTICULO.localeCompare(b.ARTICULO));
        this.cargandoArticulos = false;
      },
      error: () => {
        this._snotifyService.error(
          "No fue posible consultar los artículos asociados al grupo",
          { position: SnotifyPosition.rightTop }
        );
        this.cargandoArticulos = false;
      },
    });
  }

  applyFilterArticulo(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.articulosDataSource.filter = filterValue.trim().toLowerCase();
  }

  clickSave(): void {
    if (this.grupoForm.invalid || this.guardando) {
      return;
    }
    const data: ICreateGrupoArticuloModel = {
      grupoArticulo: this.grupoArticuloField.value as string,
      descripcion: this.descripcionField.value as string,
    };
    this.guardando = true;
    if (!this.ediData) {
      this._save(data);
    } else {
      this._edit(data);
    }
  }

  private _save(grupoArticulo: ICreateGrupoArticuloModel): void {
    this._grupoArticuloApiService.createGrupoArticulo(grupoArticulo).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.success) {
          this.grupoForm.reset();
          this._snotifyService.info("El registro se guardó sin problema", {
            position: SnotifyPosition.rightTop,
          });
          this._dialogRef.close("save");
        } else {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
      error: () => {
        this.guardando = false;
        this._snotifyService.error(
          "Ocurrió un error al guardar el grupo de artículo",
          { position: SnotifyPosition.rightTop }
        );
      },
    });
  }

  private _edit(grupoArticulo: ICreateGrupoArticuloModel): void {
    this._grupoArticuloApiService
      .updateGrupoArticulo(this.ediData.GRUPO_ARTICULO, grupoArticulo)
      .subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.success) {
            this.grupoForm.reset();
            this._snotifyService.info("El registro se actualizó sin problema", {
              position: SnotifyPosition.rightTop,
            });
            this._dialogRef.close("update");
          } else {
            this._snotifyService.error(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
          }
        },
        error: () => {
          this.guardando = false;
          this._snotifyService.error(
            "Ocurrió un error al actualizar el grupo de artículo",
            { position: SnotifyPosition.rightTop }
          );
        },
      });
  }

  get grupoArticuloField(): AbstractControl {
    return this.grupoForm.get("grupoArticulo")!;
  }
  get descripcionField(): AbstractControl {
    return this.grupoForm.get("descripcion")!;
  }
}
