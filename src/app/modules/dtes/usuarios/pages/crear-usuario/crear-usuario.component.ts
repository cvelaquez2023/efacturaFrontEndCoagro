import { IRequestGuardarUser } from "./../../../../auth/services/api/user-api-model-interface";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserApiService } from "@app/modules/auth/services/api/user-api.service";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

@Component({
  selector: "app-crear-usuario",
  templateUrl: "./crear-usuario.component.html",
  styleUrls: ["./crear-usuario.component.scss"],
})
export class CrearUsuarioComponent {
  usuarioForm!: FormGroup;
  actionBtn: string = "Guardar";
  activo = true;
  constructor(
    private _formBuilder: FormBuilder,
    private _userApiService: UserApiService,
    private _snotifyService: SnotifyService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public ediData: any,
    private _dialogRef: MatDialogRef<CrearUsuarioComponent>
  ) {
    this._loadFormGroup();
  }
  private _loadFormGroup(): void {
    this.usuarioForm = this._formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      nombres: ["", [Validators.required]],
      password: ["", [Validators.required]],
      rol: ["", [Validators.required]],
      activo: [true, [Validators.required]],
    });
    if (this.ediData) {
      this.actionBtn = "Editar";
      this.usuarioForm.controls["email"].setValue(this.ediData.email);
      this.usuarioForm.controls["nombres"].setValue(this.ediData.nombres);
      this.usuarioForm.controls["activo"].setValue(this.ediData.activo);
      this.usuarioForm.controls["rol"].setValue(this.ediData.rol);
      this.usuarioForm.controls["password"].setValue(this.ediData.password);
    }
  }

  clickSave(): void {
    if (this.usuarioForm.invalid) {
      this._snotifyService.error("Todos los Campos son Requeridos", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    if (!this.ediData) {
      const sendUser: IRequestGuardarUser = {
        email: this.emailField.value as string,
        nombres: this.nombreField.value as string,
        password: this.passwordField.value as string,
        activo: this.activoFiel.value as boolean,
        rol: this.rolField.value as string,
      };
      this._save(sendUser);
    } else {
      const sendUser: IRequestGuardarUser = {
        email: this.emailField.value as string,
        nombres: this.nombreField.value as string,
        password: this.passwordField.value as string,
        activo: this.activoFiel.value as boolean,
        rol: this.rolField.value as string,
      };
      this._edit(sendUser);
    }
  }

  private _save(usuario: IRequestGuardarUser) {
    console.log(usuario);

    this._userApiService.postUsuario(usuario).subscribe({
      next: (response) => {
        if (response.success === true) {
          this.usuarioForm.reset();
          this._snotifyService.info("El Usuario se Registro con Exito", {
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
  private _edit(usuario: IRequestGuardarUser) {
    console.log(usuario);
  }

  get emailField(): AbstractControl {
    return this.usuarioForm.get("email")!;
  }
  get nombreField(): AbstractControl {
    return this.usuarioForm.get("nombres")!;
  }
  get passwordField(): AbstractControl {
    return this.usuarioForm.get("password")!;
  }
  get rolField(): AbstractControl {
    return this.usuarioForm.get("rol")!;
  }
  get activoFiel(): AbstractControl {
    return this.usuarioForm.get("activo")!;
  }
}
