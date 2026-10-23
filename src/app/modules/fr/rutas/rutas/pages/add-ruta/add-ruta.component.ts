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
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { IResponse } from "@app/shared/api-models-base-interface";
import { RutaApiService } from "../../service/ruta-api.service";
import { RutaConsecutRtApiService } from "../../service/ruta-consecut-rt-api.service";
import {
  ICreateRutaModel,
  IResponseRuta,
} from "../../model/ruta-fr-model-interface";
import { ICompaniaConsecutivoRuta } from "../../model/detalle-ruta-model-interface";
import {
  IResponseRutaConsecutRt,
  IRutaConsecutRtModel,
} from "../../model/ruta-consecut-rt-model-interface";
import {
  COMPANIAS_DISPONIBLES,
  ICompaniaF1Item,
  NCF_DISPONIBLES,
} from "../../model/detalle-ruta-mock-data";
import {
  F1SelectorComponent,
  IF1Item,
} from "../../../shared/f1-selector/f1-selector.component";

/** Columnas NOT NULL de RUTA_CONSECUT_RT (el backend las exige en el POST). */
const CONSECUTIVOS_REQUERIDOS: {
  campo: keyof ICompaniaConsecutivoRuta;
  label: string;
}[] = [
  { campo: "pedido", label: "Pedido" },
  { campo: "pedidoConDescuento", label: "Pedido Con Descuento" },
  { campo: "factura", label: "Factura" },
  { campo: "devolucion", label: "Devolución" },
  { campo: "inventario", label: "Inventario" },
  { campo: "reciboCobro", label: "Recibo Cobro" },
];

@Component({
  selector: "app-add-ruta",
  templateUrl: "./add-ruta.component.html",
  styleUrls: ["./add-ruta.component.scss"],
})
export class AddRutaComponent {
  rutaForm!: FormGroup;
  actionBtn = "Guardar";

  /** Consecutivos de esta ruta, guardados en ERPADMIN.RUTA_CONSECUT_RT (/fr/rutaConsecutRt).
   *  La tabla es 1:1 con la ruta (COMPANIA siempre NULL), así que la grilla admite una fila. */
  filas: ICompaniaConsecutivoRuta[] = [];
  filaSeleccionada: ICompaniaConsecutivoRuta | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private _rutaApiService: RutaApiService,
    private _rutaConsecutApiService: RutaConsecutRtApiService,
    private _snotifyService: SnotifyService,
    private _dialog: MatDialog,
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
    if (!this.ediData) return;
    this._rutaConsecutApiService
      .getRutaConsecutRt(this.ediData.RUTA)
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this._snotifyService.error(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
            return;
          }
          if (!response.result) return;
          this.filas = [this._filaDesdeBd(response.result)];
          this.filaSeleccionada = this.filas[0];
        },
        error: () =>
          this._snotifyService.error(
            "No se pudieron cargar los consecutivos de la ruta",
            { position: SnotifyPosition.rightTop }
          ),
      });
  }

  private _filaDesdeBd(c: IResponseRutaConsecutRt): ICompaniaConsecutivoRuta {
    return {
      compania: c.COMPANIA ?? "",
      companiaNombre: "",
      pais: "SV",
      devolucion: c.DEVOLUCION ?? "",
      pedido: c.PEDIDO ?? "",
      pedidoConDescuento: c.PEDIDO_DESCUENTO ?? "",
      factura: c.FACTURA ?? "",
      inventario: c.INVENTARIO ?? "",
      reciboCobro: c.RECIBO ?? "",
      notaCredito: c.NOTACREDITO ?? "",
      ncfConsumidorFinal: c.NCF_CONSUMIDOR_F ?? "",
      ncfCreditoFiscal: "",
      resolucionFactura: "",
      resolucionDevolucion: "",
    };
  }

  seleccionarFilaConsecutivo(fila: ICompaniaConsecutivoRuta): void {
    this.filaSeleccionada = fila;
  }

  nuevaCompania(): void {
    if (this.filas.length > 0) {
      this._snotifyService.warning(
        "La ruta ya tiene consecutivos definidos (solo admite una configuración)",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
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
        this.filas = [nueva];
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
    const fila = this.filas[0];
    if (fila) {
      const faltantes = CONSECUTIVOS_REQUERIDOS.filter(
        (r) => !(fila[r.campo] as string)?.trim()
      ).map((r) => r.label);
      if (faltantes.length > 0) {
        this._snotifyService.warning(
          `Complete los consecutivos: ${faltantes.join(", ")}`,
          { position: SnotifyPosition.rightTop }
        );
        return;
      }
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
          this._finalizar(
            ruta.ruta,
            "El registro se guardó sin problema",
            "save"
          );
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
          this._finalizar(
            this.ediData.RUTA,
            "El registro se actualizó sin problema",
            "update"
          );
        } else {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  private _datosConsecutivos(
    fila: ICompaniaConsecutivoRuta
  ): IRutaConsecutRtModel {
    const texto = (valor: string) => (valor ?? "").trim().toUpperCase();
    return {
      pedido: texto(fila.pedido),
      pedidoDescuento: texto(fila.pedidoConDescuento),
      factura: texto(fila.factura),
      devolucion: texto(fila.devolucion),
      inventario: texto(fila.inventario),
      recibo: texto(fila.reciboCobro),
      notacredito: texto(fila.notaCredito) || null,
      ncfConsumidorF: texto(fila.ncfConsumidorFinal) || null,
    };
  }

  /** Sincroniza la grilla con RUTA_CONSECUT_RT: PUT si la ruta ya tiene fila, POST si no, y
   *  DELETE si se quitó la fila de la grilla. Se consulta en el momento porque la tabla no tiene
   *  FK a RUTA_RT y puede quedar una fila previa de una ruta eliminada con el mismo código. */
  private _guardarConsecutivos(ruta: string): Observable<IResponse<unknown>> {
    const fila = this.filas[0];
    return this._rutaConsecutApiService.getRutaConsecutRt(ruta).pipe(
      switchMap((response): Observable<IResponse<unknown>> => {
        const existe = response.success && !!response.result;
        if (!fila) {
          return existe
            ? this._rutaConsecutApiService.deleteRutaConsecutRt(ruta)
            : of({ success: true, errors: [], result: null });
        }
        const datos = this._datosConsecutivos(fila);
        return existe
          ? this._rutaConsecutApiService.updateRutaConsecutRt(ruta, datos)
          : this._rutaConsecutApiService.createRutaConsecutRt({
              ruta,
              ...datos,
            });
      })
    );
  }

  /** Guarda los consecutivos después de guardar la ruta y cierra el diálogo. */
  private _finalizar(ruta: string, mensaje: string, resultado: string): void {
    const cerrar = () => {
      this.rutaForm.reset();
      this._dialogRef.close(resultado);
    };
    this._guardarConsecutivos(ruta).subscribe({
      next: (response) => {
        if (response.success) {
          this._snotifyService.info(mensaje, {
            position: SnotifyPosition.rightTop,
          });
        } else {
          this._snotifyService.error(
            `La ruta se guardó, pero los consecutivos no: ${response.errors[0]}`,
            { position: SnotifyPosition.rightTop }
          );
        }
        cerrar();
      },
      error: () => {
        this._snotifyService.error(
          "La ruta se guardó, pero no se pudieron guardar los consecutivos",
          { position: SnotifyPosition.rightTop }
        );
        cerrar();
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
