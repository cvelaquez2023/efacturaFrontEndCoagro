import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ISugeridoVentaFr } from "../../model/sugerido-venta-fr-model-interface";

@Component({
  selector: "app-add-sugerido-venta",
  templateUrl: "./add-sugerido-venta.component.html",
  styleUrls: ["./add-sugerido-venta.component.scss"],
})
export class AddSugeridoVentaComponent {
  sugeridoForm!: FormGroup;
  actionBtn = "Guardar";

  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public ediData: ISugeridoVentaFr,
    private _dialogRef: MatDialogRef<AddSugeridoVentaComponent>
  ) {
    this._loadFormGroup();
  }

  private _loadFormGroup(): void {
    this.sugeridoForm = this._formBuilder.group({
      sugerido: ["", [Validators.required, Validators.maxLength(10)]],
      descripcion: ["", [Validators.required, Validators.maxLength(40)]],
    });
    if (this.ediData) {
      this.actionBtn = "Editar";
      this.sugeridoForm.patchValue(this.ediData);
      this.sugeridoForm.controls["sugerido"].disable();
    }
  }

  clickSave(): void {
    if (this.sugeridoForm.invalid) {
      return;
    }
    const data: ISugeridoVentaFr = {
      sugerido: this.ediData
        ? (this.ediData.sugerido as string)
        : (this.sugeridoField.value as string),
      descripcion: this.descripcionField.value as string,
    };
    this._dialogRef.close(data);
  }

  get sugeridoField(): AbstractControl {
    return this.sugeridoForm.get("sugerido")!;
  }
  get descripcionField(): AbstractControl {
    return this.sugeridoForm.get("descripcion")!;
  }
}
