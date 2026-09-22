import {
  IResponseConjunto,
  IResponseConjuntoLogin,
  IRequestLogin,
} from "./../../../services/api/user-api-model-interface";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { IDataUser } from "@app/modules/auth/models/data-user";
import { IResponseLogin } from "@app/modules/auth/services/api/user-api-model-interface";
import { UserApiService } from "@app/modules/auth/services/api/user-api.service";
import { ChanelHeaderService } from "@app/services/local/chanel-header.service";
import { SessionStorageService } from "@app/services/local/storage/storage.service";
import { KEYS_WEB_STORAGE } from "@app/util/enums";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

@Component({
  selector: "app-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.scss"],
})
export class LoginPageComponent {
  inputValue = "";
  hide = true;
  constructor(
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _userApiService: UserApiService,
    private _chanelHeaderService: ChanelHeaderService,
    private _sessionStorageService: SessionStorageService,
    private _snotifyService: SnotifyService
  ) {
    this._loadFormGroup();
  }

  disableButton = false;
  listaEmpresa: IResponseConjunto[] = [];
  listaConjunto: IResponseConjuntoLogin[] = [];
  data: IRequestLogin[] = [];
  formGroup!: FormGroup;
  clickLogin(): void {
    if (this.formGroup.valid) {
      const email = this.formGroup.get("email")?.value as string;
      const password = this.formGroup.get("password")?.value as string;
      const empresa = this.formGroup.get("empresa")?.value as string;

      //const conjunto = this.formGroup.get('empresa')?.value as string;
      // eslint-disable-next-line no-unused-labels
      const sendData: IRequestLogin = {
        email: email,
        password: password,
        empresa: empresa,
      };
      this._login(sendData);
    }
  }

  private _login(data: IRequestLogin): void {
    if (this.formGroup.invalid) {
      console.log("null");
      return;
    }
    this._userApiService.login(data).subscribe({
      next: (response) => {
        if (response.success) {
          this._saveDateUserAndRedirect(response.result);
        } else {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
      error: (error) => {
        console.log("error", error);
      },
    });
  }

  private _saveDateUserAndRedirect(response: IResponseLogin): void {
    const dataUser: IDataUser = {
      token: response.token,
      nombres: response.usuario.nombres,
      email: response.usuario.email,
      rol: response.usuario.rol,
      isAdmin: true,
      empresa: response.usuario.empresa,
      empresaNombre: response.usuario.empresaNombre,
    };

    this._sessionStorageService.setItem(KEYS_WEB_STORAGE.DATA_USER, dataUser);
    this._redirectUser(dataUser.isAdmin);
  }

  private _redirectUser(isAdmin: boolean): void {
    const url = isAdmin ? "/" : "/";
    void this._router.navigateByUrl(url);
    this._chanelHeaderService.showUser(true);
  }

  private _loadFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      empresa: [null, Validators.required],
    });
  }
}
