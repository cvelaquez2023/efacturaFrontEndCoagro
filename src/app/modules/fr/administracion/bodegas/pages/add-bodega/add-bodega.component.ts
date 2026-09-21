import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { BodegaFrApiService } from "../../service/bodega-fr-api.service";
import {
  ICreateBodegaFrModel,
  IResponseBodegaFr,
} from "../../model/bodega-fr-model-interface";

@Component({
  selector: "app-add-bodega",
  templateUrl: "./add-bodega.component.html",
  styleUrls: ["./add-bodega.component.scss"],
})
export class AddBodegaComponent {
  bodegaForm!: FormGroup;
  actionBtn = "Guardar";
  bodegasErpDisponibles: IResponseBodegaFr[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _bodegaFrApiService: BodegaFrApiService,
    private _snotifyService: SnotifyService,
    @Inject(MAT_DIALOG_DATA) public ediData: IResponseBodegaFr,
    private _dialogRef: MatDialogRef<AddBodegaComponent>
  ) {
    this._loadFormGroup();
    if (!this.ediData) {
      this._loadBodegasErpDisponibles();
    }
  }

  private _loadFormGroup(): void {
    this.bodegaForm = this._formBuilder.group({
      codigo: ["", [Validators.required, Validators.maxLength(4)]],
      nombre: ["", [Validators.required, Validators.maxLength(40)]],
      bodegaErp: ["", [Validators.required]],
    });
    if (this.ediData) {
      this.actionBtn = "Editar";
      this.bodegaForm.controls["codigo"].setValue(this.ediData.BODEGA);
      this.bodegaForm.controls["codigo"].disable();
      this.bodegaForm.controls["nombre"].setValue(this.ediData.NOMBRE);
      this.bodegaForm.controls["bodegaErp"].clearValidators();
      this.bodegaForm.controls["bodegaErp"].updateValueAndValidity();
    }
  }

  /** Bodegas ya cargadas directamente del ERP (BODEGA_ERP == BODEGA): unicos vinculos validos para un alias local. */
  private _loadBodegasErpDisponibles(): void {
    this._bodegaFrApiService.getBodegas().subscribe({
      next: (response) => {
        if (response.success) {
          this.bodegasErpDisponibles = response.result.filter(
            (b) => !!b.BODEGA_ERP && b.BODEGA_ERP === b.BODEGA
          );
          if (this.bodegasErpDisponibles.length === 0) {
            this._snotifyService.warning(
              'Primero carga una bodega del ERP desde "Cargar Bodega"',
              {
                position: SnotifyPosition.rightTop,
              }
            );
          }
        }
      },
    });
  }

  clickSave(): void {
    if (this.bodegaForm.invalid) {
      return;
    }
    if (!this.ediData) {
      this._save();
    } else {
      this._edit();
    }
  }

  private _save(): void {
    const data: ICreateBodegaFrModel = {
      bodega: this.codigoField.value as string,
      nombre: this.nombreField.value as string,
      bodegaErp: this.bodegaErpField.value as string,
    };
    this._bodegaFrApiService.createBodega(data).subscribe({
      next: (response) => {
        if (response.success) {
          this.bodegaForm.reset();
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

  private _edit(): void {
    this._bodegaFrApiService
      .updateBodega(this.ediData.BODEGA, {
        nombre: this.nombreField.value as string,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.bodegaForm.reset();
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

  get codigoField(): AbstractControl {
    return this.bodegaForm.get("codigo")!;
  }
  get nombreField(): AbstractControl {
    return this.bodegaForm.get("nombre")!;
  }
  get bodegaErpField(): AbstractControl {
    return this.bodegaForm.get("bodegaErp")!;
  }
}
