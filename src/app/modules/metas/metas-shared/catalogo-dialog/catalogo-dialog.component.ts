import { Component, Inject } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { MetasApiService, mensajeErrorHttp } from "../metas-api.service";
import { estaActivo, ICatalogoConfig, ICatalogoMeta, primerError } from "../metas.model";

export interface ICatalogoDialogData {
  config: ICatalogoConfig;
  item: ICatalogoMeta | null;
}

/** Crear / editar un líder, proveedor o línea de negocio. Cierra con `true` si guardó. */
@Component({
  selector: "app-catalogo-dialog",
  templateUrl: "./catalogo-dialog.component.html",
})
export class CatalogoDialogComponent {
  form: FormGroup;
  guardando = false;
  readonly config: ICatalogoConfig;

  constructor(
    fb: FormBuilder,
    private _api: MetasApiService,
    private _snotify: SnotifyService,
    private _ref: MatDialogRef<CatalogoDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: ICatalogoDialogData
  ) {
    this.config = data.config;
    const item = data.item;
    this.form = fb.group({
      codigo: [item?.codigo ?? "", [Validators.required, Validators.maxLength(this.config.codigoMax)]],
      nombre: [item?.nombre ?? "", [Validators.required, Validators.maxLength(100)]],
      email: [item?.email ?? "", [Validators.email, Validators.maxLength(100)]],
      activo: [item ? estaActivo(item, this.config) : true],
    });
  }

  get esEdicion(): boolean {
    return !!this.data.item;
  }

  get codigo(): AbstractControl {
    return this.form.get("codigo")!;
  }
  get nombre(): AbstractControl {
    return this.form.get("nombre")!;
  }
  get email(): AbstractControl {
    return this.form.get("email")!;
  }

  guardar(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value as { codigo: string; nombre: string; email: string; activo: boolean };
    const body: Record<string, unknown> = {
      codigo: String(v.codigo).trim(),
      nombre: String(v.nombre).trim(),
      [this.config.campoActivo]: !!v.activo,
    };
    if (this.config.conEmail) body["email"] = String(v.email ?? "").trim() || null;

    this.guardando = true;
    const peticion = this.data.item
      ? this._api.actualizarCatalogo(this.config, this.data.item.id, body)
      : this._api.crearCatalogo(this.config, body);
    peticion.subscribe({
      next: (r) => {
        this.guardando = false;
        if (r.success) {
          this._snotify.info(this.esEdicion ? "El registro se actualizó" : "El registro se guardó", {
            position: SnotifyPosition.rightTop,
          });
          this._ref.close(true);
        } else {
          this._snotify.error(primerError(r.errors, "No se pudo guardar"), { position: SnotifyPosition.rightTop });
        }
      },
      error: (e) => {
        this.guardando = false;
        this._snotify.error(mensajeErrorHttp(e), { position: SnotifyPosition.rightTop });
      },
    });
  }
}
