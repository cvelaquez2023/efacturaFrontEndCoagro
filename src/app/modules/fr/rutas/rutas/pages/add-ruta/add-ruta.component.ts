import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { RutaApiService } from "../../service/ruta-api.service";
import {
  ICreateRutaModel,
  IResponseRuta,
} from "../../model/ruta-fr-model-interface";
import { ICompaniaConsecutivoRuta } from "../../model/detalle-ruta-model-interface";
import {
  COMPANIAS_DISPONIBLES,
  ICompaniaF1Item,
  NCF_DISPONIBLES,
} from "../../model/detalle-ruta-mock-data";
import { DetalleRutaMockStoreService } from "../../service/detalle-ruta-mock-store.service";
import {
  F1SelectorComponent,
  IF1Item,
} from "../../../shared/f1-selector/f1-selector.component";

@Component({
  selector: "app-add-ruta",
  templateUrl: "./add-ruta.component.html",
  styleUrls: ["./add-ruta.component.scss"],
})
export class AddRutaComponent {
  rutaForm!: FormGroup;
  actionBtn = "Guardar";

  /** Consecutivos por compañía de esta ruta (sin backend aún, ver DetalleRutaMockStoreService). */
  filas: ICompaniaConsecutivoRuta[] = [];
  filaSeleccionada: ICompaniaConsecutivoRuta | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private _rutaApiService: RutaApiService,
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
    private _store: DetalleRutaMockStoreService,
    @Inject(MAT_DIALOG_DATA) public ediData: IResponseRuta,
    private _dialogRef: MatDialogRef<AddRutaComponent>
  ) {
    this._loadFormGroup();
    this._cargarConsecutivos();
  }

  private _loadFormGroup(): void {
    this.rutaForm = this._formBuilder.group({
      ruta: ["", [Validators.required, Validators.maxLength(4)]],
      descripcion: ["", [Validators.required, Validators.maxLength(40)]],
      periodicidad: ["D", [Validators.required]],
      activa: ["S", [Validators.required]],
    });
    if (this.ediData) {
      this.actionBtn = "Editar";
      this.rutaForm.controls["ruta"].setValue(this.ediData.RUTA);
      this.rutaForm.controls["ruta"].disable();
      this.rutaForm.controls["descripcion"].setValue(this.ediData.DESCRIPCION);
      this.rutaForm.controls["periodicidad"].setValue(
        this.ediData.PERIODICIDAD
      );
      this.rutaForm.controls["activa"].setValue(this.ediData.ACTIVA);
    }
  }

  private _cargarConsecutivos(): void {
    this.filas = this._store.getFilas(this.ediData?.RUTA ?? "");
    this.filaSeleccionada = this.filas[0] ?? null;
  }

  seleccionarFilaConsecutivo(fila: ICompaniaConsecutivoRuta): void {
    this.filaSeleccionada = fila;
  }

  nuevaCompania(): void {
    this._dialog
      .open(F1SelectorComponent, {
        width: "40%",
        data: {
          titulo: "Seleccionar Compañía",
          items: COMPANIAS_DISPONIBLES,
          columnaCodigo: "Compañía",
          columnaNombre: "Nombre",
        },
      })
      .afterClosed()
      .subscribe((seleccion: ICompaniaF1Item) => {
        if (!seleccion) return;
        if (this.filas.some((f) => f.compania === seleccion.codigo)) {
          this._snotifyService.warning(
            "Esa compañía ya tiene consecutivos definidos en esta ruta",
            { position: SnotifyPosition.rightTop }
          );
          return;
        }
        const nueva: ICompaniaConsecutivoRuta = {
          compania: seleccion.codigo,
          companiaNombre: seleccion.nombre,
          pais: seleccion.pais,
          devolucion: "",
          pedido: "",
          pedidoConDescuento: "",
          factura: "",
          inventario: "",
          reciboCobro: "",
          notaCredito: "",
          ncfConsumidorFinal: "",
          ncfCreditoFiscal: "",
          resolucionFactura: "",
          resolucionDevolucion: "",
        };
        this.filas = [...this.filas, nueva];
        this.filaSeleccionada = nueva;
      });
  }

  eliminarCompaniaSeleccionada(): void {
    if (!this.filaSeleccionada) return;
    this._snotifyService.confirm(
      "¿Eliminar los consecutivos de esta compañía para la ruta?",
      {
        position: SnotifyPosition.rightTop,
        buttons: [
          {
            text: "SI",
            bold: true,
            action: (toast) => {
              this._snotifyService.remove(toast.id);
              this.filas = this.filas.filter(
                (f) => f !== this.filaSeleccionada
              );
              this.filaSeleccionada = this.filas[0] ?? null;
            },
          },
          { text: "CANCELAR" },
        ],
      }
    );
  }

  abrirPickerNcf(fila: ICompaniaConsecutivoRuta): void {
    this._dialog
      .open(F1SelectorComponent, {
        width: "40%",
        data: {
          titulo: "Seleccionar NCF",
          items: NCF_DISPONIBLES,
          columnaCodigo: "NCF",
          columnaNombre: "Descripción",
        },
      })
      .afterClosed()
      .subscribe((seleccion: IF1Item) => {
        if (seleccion) fila.ncfConsumidorFinal = seleccion.codigo;
      });
  }

  clickSave(): void {
    if (this.rutaForm.invalid) {
      return;
    }
    const data: ICreateRutaModel = {
      ruta: this.rutaField.value as string,
      descripcion: this.descripcionField.value as string,
      periodicidad: this.periodicidadField.value as string,
      activa: this.activaField.value as string,
      // Grupo Teléfono no forma parte de este formulario (no está en el manual), pero se
      // preserva su valor actual en edición para no perderlo al guardar el resto de campos.
      grupoTelefono: this.ediData?.GRUPO_TELEFONO,
    };
    if (!this.ediData) {
      this._save(data);
    } else {
      this._edit(data);
    }
  }

  private _save(ruta: ICreateRutaModel): void {
    this._rutaApiService.createRuta(ruta).subscribe({
      next: (response) => {
        if (response.success) {
          this._store.guardarFilas(ruta.ruta, this.filas);
          this.rutaForm.reset();
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
    });
  }

  private _edit(ruta: ICreateRutaModel): void {
    this._rutaApiService.updateRuta(this.ediData.RUTA, ruta).subscribe({
      next: (response) => {
        if (response.success) {
          this._store.guardarFilas(this.ediData.RUTA, this.filas);
          this.rutaForm.reset();
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
    });
  }

  get rutaField(): AbstractControl {
    return this.rutaForm.get("ruta")!;
  }
  get descripcionField(): AbstractControl {
    return this.rutaForm.get("descripcion")!;
  }
  get periodicidadField(): AbstractControl {
    return this.rutaForm.get("periodicidad")!;
  }
  get activaField(): AbstractControl {
    return this.rutaForm.get("activa")!;
  }
}
