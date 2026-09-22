import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { IActualizacionFr } from "../../model/actualizacion-fr-model-interface";

@Component({
  selector: "app-add-actualizacion",
  templateUrl: "./add-actualizacion.component.html",
  styleUrls: ["./add-actualizacion.component.scss"],
})
export class AddActualizacionComponent {
  actualizacionForm!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<AddActualizacionComponent>
  ) {
    this.actualizacionForm = this._formBuilder.group({
      nombre: ["", [Validators.required]],
      tipo: ["Paquete", [Validators.required]],
      handhelds: ["", [Validators.required]],
    });
  }

  clickSave(): void {
    if (this.actualizacionForm.invalid) {
      return;
    }
    const data: IActualizacionFr = {
      nombre: this.nombreField.value as string,
      tipo: this.tipoField.value as "Paquete" | "Reporte" | "Otros",
      fecha: new Date().toISOString().slice(0, 10),
      handhelds: this.handheldsField.value as string,
      publicada: false,
    };
    this._dialogRef.close(data);
  }

  get nombreField(): AbstractControl {
    return this.actualizacionForm.get("nombre")!;
  }
  get tipoField(): AbstractControl {
    return this.actualizacionForm.get("tipo")!;
  }
  get handheldsField(): AbstractControl {
    return this.actualizacionForm.get("handhelds")!;
  }
}
