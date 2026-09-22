import { IResponseCliente } from "./../../../../ci/articulo/model/articulo-api-model-interface";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Inject, OnInit } from "@angular/core";
import { ClienteDteApiService } from "../../service/cliente-dte-api.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { core } from "@angular/compiler";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

@Component({
  selector: "app-envio-email",
  templateUrl: "./envio-email.component.html",
  styleUrls: ["./envio-email.component.scss"],
})
export class EnvioEmailComponent {
  vendedorForm!: FormGroup;
  data: IResponseCliente[] = [];
  constructor(
    private _dteApiService: ClienteDteApiService,
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public editaData: any,
    private _dialogRef: MatDialogRef<EnvioEmailComponent>
  ) {
    this._loadDoc();
  }

  private _loadDoc(): void {
    this.vendedorForm = this._formBuilder.group({
      correo: ["", [Validators.email, Validators.required]],
    });

    this._dteApiService.getCliente(this.editaData.Dte as string).subscribe({
      next: (response) => {
        this.data = response.result;

        for (let x = 0; x < this.data.length; x++) {
          const element = this.data[x];
          this.vendedorForm.controls["correo"].setValue(element.CORREODTE);
        }
      },
    });
  }

  clickEnviar(): void {
    const datos = {
      dte: this.editaData.Dte as string,
      correo: this.correoField.value as string,
    };
    this._dteApiService.postEnvioEmail(datos).subscribe({
      next: (response) => {
        if (response.success) {
          this._snotifyService.info("Se envio el correo problema", {
            position: SnotifyPosition.rightTop,
          });
          this._dialogRef.close("update");
        }
      },
    });
  }

  get correoField(): AbstractControl {
    return this.vendedorForm.get("correo")!;
  }
}
