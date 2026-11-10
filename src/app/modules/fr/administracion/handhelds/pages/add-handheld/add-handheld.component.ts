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
import { HandheldApiService } from "../../service/handheld-api.service";
import {
  ICreateHandheldModel,
  IResponseHandheld,
} from "../../model/handheld-fr-model-interface";
import {
  IHandheldConfig,
  IHandheldConfigDialogData,
  HANDHELD_CONFIG_DEFAULT,
} from "../../model/handheld-config-model";
import { HandheldConfigApiService } from "../../service/handheld-config-api.service";
import { ConfigHandheldComponent } from "../config-handheld/config-handheld.component";

@Component({
  selector: "app-add-handheld",
  templateUrl: "./add-handheld.component.html",
  styleUrls: ["./add-handheld.component.scss"],
})
export class AddHandheldComponent {
  handheldForm!: FormGroup;
  actionBtn = "Guardar";
  config: IHandheldConfig = { ...HANDHELD_CONFIG_DEFAULT };
  /** true mientras se lee la configuración guardada (CONFIG_HH) de la handheld a editar. */
  cargandoConfig = false;
  /** Solo se escribe CONFIG_HH si el usuario aceptó cambios en el diálogo de Configuración. */
  private _configCambiada = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _handheldApiService: HandheldApiService,
    private _snotifyService: SnotifyService,
    @Inject(MAT_DIALOG_DATA) public ediData: IResponseHandheld,
    private _dialogRef: MatDialogRef<AddHandheldComponent>,
    private _dialog: MatDialog,
    private _configApi: HandheldConfigApiService
  ) {
    this._loadFormGroup();
    if (this.ediData?.HANDHELD) {
      this.cargandoConfig = true;
      this._configApi.get(this.ediData.HANDHELD).subscribe({
        next: (config) => {
          this.config = config;
          this.cargandoConfig = false;
        },
        error: () => (this.cargandoConfig = false),
      });
    }
  }

  private _loadFormGroup(): void {
    this.handheldForm = this._formBuilder.group({
      handheld: ["", [Validators.required, Validators.maxLength(4)]],
      descripcion: ["", [Validators.required, Validators.maxLength(40)]],
      serie: ["", [Validators.maxLength(15)]],
      modelo: ["", [Validators.maxLength(15)]],
      estado: ["A", [Validators.required]],
      firma: ["", [Validators.maxLength(2048)]],
    });
    if (this.ediData) {
      this.actionBtn = "Editar";
      this.handheldForm.controls["handheld"].setValue(this.ediData.HANDHELD);
      this.handheldForm.controls["handheld"].disable();
      this.handheldForm.controls["descripcion"].setValue(
        this.ediData.DESCRIPCION
      );
      this.handheldForm.controls["serie"].setValue(this.ediData.SERIE);
      this.handheldForm.controls["modelo"].setValue(this.ediData.MODELO);
      this.handheldForm.controls["estado"].setValue(this.ediData.ESTADO);
      this.handheldForm.controls["firma"].setValue(this.ediData.FIRMA);
    }
  }

  // Abre la "Configuración General" del handheld; el resultado se guarda al Guardar/Editar.
  openConfig(): void {
    const data: IHandheldConfigDialogData = {
      handheld: ((this.handheldField.value as string) || "").toUpperCase(),
      descripcion: this.descripcionField.value as string,
      config: { ...this.config },
    };
    this._dialog
      .open(ConfigHandheldComponent, {
        width: "960px",
        maxWidth: "96vw",
        maxHeight: "94vh",
        autoFocus: false,
        data,
      })
      .afterClosed()
      .subscribe((result?: IHandheldConfig) => {
        if (result) {
          this.config = result;
          this._configCambiada = true;
        }
      });
  }

  clickSave(): void {
    if (this.handheldForm.invalid) {
      this.handheldForm.markAllAsTouched();
      return;
    }
    const data: ICreateHandheldModel = {
      handheld: ((this.handheldField.value as string) || "").toUpperCase(),
      descripcion: this.descripcionField.value as string,
      serie: this.serieField.value as string,
      modelo: this.modeloField.value as string,
      estado: this.estadoField.value as string,
      firma: this.firmaField.value as string,
    };
    if (!this.ediData) {
      this._save(data);
    } else {
      this._edit(data);
    }
  }

  private _save(handheld: ICreateHandheldModel): void {
    this._handheldApiService.createHandheld(handheld).subscribe({
      next: (response) => {
        if (response.success) {
          this._terminar(handheld.handheld, "El registro se guardó sin problema", "save");
        } else {
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  private _edit(handheld: ICreateHandheldModel): void {
    this._handheldApiService
      .updateHandheld(this.ediData.HANDHELD, handheld)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this._terminar(this.ediData.HANDHELD, "El registro se actualizó sin problema", "update");
          } else {
            this._snotifyService.error(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
          }
        },
      });
  }

  /** Después de guardar la handheld, guarda su Configuración General en CONFIG_HH (si cambió)
   *  y cierra el diálogo. Si la configuración falla, la handheld ya quedó guardada: se avisa. */
  private _terminar(handheld: string, mensaje: string, cierre: "save" | "update"): void {
    const cerrar = () => {
      this.handheldForm.reset();
      this._snotifyService.info(mensaje, { position: SnotifyPosition.rightTop });
      this._dialogRef.close(cierre);
    };
    if (!this._configCambiada) {
      cerrar();
      return;
    }
    this._configApi.save(handheld, this.config).subscribe({
      next: (resp) => {
        if (!resp.success) {
          this._snotifyService.warning(
            "La handheld se guardó, pero no su configuración: " + (resp.errors?.[0] ?? ""),
            { position: SnotifyPosition.rightTop }
          );
        }
        cerrar();
      },
      error: () => cerrar(),
    });
  }

  get handheldField(): AbstractControl {
    return this.handheldForm.get("handheld")!;
  }
  get descripcionField(): AbstractControl {
    return this.handheldForm.get("descripcion")!;
  }
  get serieField(): AbstractControl {
    return this.handheldForm.get("serie")!;
  }
  get modeloField(): AbstractControl {
    return this.handheldForm.get("modelo")!;
  }
  get estadoField(): AbstractControl {
    return this.handheldForm.get("estado")!;
  }
  get firmaField(): AbstractControl {
    return this.handheldForm.get("firma")!;
  }
}
