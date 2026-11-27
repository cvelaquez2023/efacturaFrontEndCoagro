/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { error } from "console";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { formatDate } from "@angular/common";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { Component, OnInit, Inject } from "@angular/core";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ClienteDteApiService } from "@app/modules/dtes/cliente/service/cliente-dte-api.service";

/** Tipos de invalidación (CAT-024 del MH). */
export const TIPOS_ANULACION = [
  {
    valor: 1,
    texto: "1 - Error en la información del DTE",
    ayuda: "Se emitió un DTE nuevo que corrige al invalidado: indique su código de generación.",
  },
  {
    valor: 2,
    texto: "2 - Rescindir la operación realizada",
    ayuda: "La operación no se realizó o se deshizo; no lleva documento de reemplazo.",
  },
  {
    valor: 3,
    texto: "3 - Otro",
    ayuda: "Explique el motivo e indique el código de generación del DTE que lo reemplaza.",
  },
];

/** Código de generación MH: UUID en mayúsculas (36 caracteres). */
const PATRON_CODIGO_GENERACION = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

@Component({
  selector: "app-crear-invalidacion-page",
  templateUrl: "./crear-invalidacion-page.component.html",
  styleUrls: ["./crear-invalidacion-page.component.scss"],
})
export class CrearInvalidacionPageComponent {
  readonly tiposAnulacion = TIPOS_ANULACION;
  vendedorForm!: FormGroup;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  actionBtn: string = "Guardar";
  activo = true;
  fechaanula = "";
  monto = 0;
  /** Evita el doble envío mientras se espera a Hacienda. */
  enviando = false;
  constructor(
    private _formBuilder: FormBuilder,
    private _servcio: ClienteDteApiService,
    private _snotifyService: SnotifyService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public ediData: any,
    private _dialogRef: MatDialogRef<CrearInvalidacionPageComponent>
  ) {
    this._loadFormGroup();
  }

  private _loadFormGroup(): void {
    this.vendedorForm = this._formBuilder.group({
      dte: [""],
      cliente: [""],
      nombre: [""],
      codigogeneracion: [""],
      monto: [""],
      fechaanula: [""],
      personaResponsable: ["", Validators.required],
      tipoDocResponsable: ["", Validators.required],
      docResponsable: ["", Validators.required],
      personaSolicita: ["", Validators.required],
      tipoDocSolicita: ["", Validators.required],
      docSolicita: ["", Validators.required],
      motivo: ["", [Validators.required, Validators.maxLength(200)]],
      tipoAnulacion: [2, Validators.required],
      codigoGeneracionR: [""],
    });
    // Tipos 1 y 3 exigen el código de generación del DTE que reemplaza; el 2 no lo lleva.
    this.tipoAnulacionField.valueChanges.subscribe(() => this._reglasReemplazo());
    this._reglasReemplazo();
    if (this.ediData) {
      this.actionBtn = "Enviar";

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.vendedorForm.controls["dte"].setValue(this.ediData.documento);
      this.vendedorForm.controls["codigogeneracion"].setValue(
        this.ediData.codigoGeneracion
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.vendedorForm.controls["cliente"].setValue(
        this.ediData.cliente_origen
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.vendedorForm.controls["nombre"].setValue(this.ediData.nombre);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.vendedorForm.controls["monto"].setValue(this.ediData.monto);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.vendedorForm.controls["fechaanula"].setValue(
        this.ediData.fecha_anulacion
      );
      this.fechaanula = this.ediData.fecha_anulacion;
      this.monto = this.ediData.monto;
    }
  }
  /** El tipo elegido exige documento de reemplazo (1 y 3). */
  get requiereReemplazo(): boolean {
    return Number(this.tipoAnulacionField.value) !== 2;
  }

  get ayudaTipo(): string {
    return this.tiposAnulacion.find((t) => t.valor === Number(this.tipoAnulacionField.value))?.ayuda ?? "";
  }

  private _reglasReemplazo(): void {
    const control = this.codigoGeneracionRField;
    if (this.requiereReemplazo) {
      control.setValidators([Validators.required, Validators.pattern(PATRON_CODIGO_GENERACION)]);
    } else {
      control.clearValidators();
      control.setValue("", { emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  clickSave(): void {
    if (this.enviando) return;
    if (this.vendedorForm.invalid) {
      this.vendedorForm.markAllAsTouched();
      this._snotifyService.warning("Revise los campos marcados en rojo", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    const reemplazo = String(this.codigoGeneracionRField.value ?? "").trim().toUpperCase();
    if (this.requiereReemplazo && reemplazo === String(this.codigogeneracionField.value ?? "").trim().toUpperCase()) {
      this._snotifyService.warning("El documento de reemplazo no puede ser el mismo que se invalida", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    const datos = {
      documento: this.dteField.value as string,
      tipoAnulacion: Number(this.tipoAnulacionField.value),
      codigoGeneracionR: this.requiereReemplazo ? reemplazo : null,
      motivoAnulacion: this.motivoField.value as string,
      nombreResponsable: this.personaResponsableField.value as string,
      tipoDocResponsable: this.tipoDocResponsableField.value as string,
      numDocResponsable: this.docResponsableField.value as string,
      nombreSolicita: this.personaSolicitaField.value as string,
      numDocSolicita: this.docSolicitaField.value as string,
      tipoDocSolicita: this.tipoDocSolicitaField.value as string,
    };
    this.enviando = true;
    this._servcio.postDteCreateInvalidacion(datos).subscribe({
      next: (response) => {
        this.enviando = false;
        if (response.success) {
          this.vendedorForm.reset();
          this._snotifyService.info("El registro se guardo sin problema", {
            position: SnotifyPosition.rightTop,
          });
          this._dialogRef.close("update");
        } else {
          this._snotifyService.error(this._mensajeError(response), {
            position: SnotifyPosition.rightTop,
            timeout: 10000,
          });
        }
      },
      error: (e) => {
        this.enviando = false;
        // Antes solo se escribía en consola: "Sitio en Contingencia", "Documento no existe"...
        this._snotifyService.error(this._mensajeError(e?.error), {
          position: SnotifyPosition.rightTop,
          timeout: 10000,
        });
      },
    });
  }

  /** Mensaje para el usuario: el motivo real de Hacienda o del backend, no uno genérico. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _mensajeError(r: any): string {
    const hacienda = r?.result?.descripcionMsg;
    const observaciones: string[] = Array.isArray(r?.result?.observaciones) ? r.result.observaciones : [];
    const base = r?.errors?.[0] || r?.messaje || "No se pudo enviar la invalidación";
    if (hacienda) {
      return `Hacienda: ${hacienda}${observaciones.length ? " · " + observaciones.join(" · ") : ""}`;
    }
    return String(base);
  }

  get dteField(): AbstractControl {
    return this.vendedorForm.get("dte")!;
  }
  get clienteField(): AbstractControl {
    return this.vendedorForm.get("cliente")!;
  }
  get nombreField(): AbstractControl {
    return this.vendedorForm.get("nombre")!;
  }
  get codigogeneracionField(): AbstractControl {
    return this.vendedorForm.get("codigogeneracion")!;
  }
  get montoField(): AbstractControl {
    return this.vendedorForm.get("monto")!;
  }
  get fechaanulaField(): AbstractControl {
    return this.vendedorForm.get("fechaanula")!;
  }
  get personaResponsableField(): AbstractControl {
    return this.vendedorForm.get("personaResponsable")!;
  }

  get tipoDocResponsableField(): AbstractControl {
    return this.vendedorForm.get("tipoDocResponsable")!;
  }
  get docResponsableField(): AbstractControl {
    return this.vendedorForm.get("docResponsable")!;
  }

  get personaSolicitaField(): AbstractControl {
    return this.vendedorForm.get("personaSolicita")!;
  }
  get tipoDocSolicitaField(): AbstractControl {
    return this.vendedorForm.get("tipoDocSolicita")!;
  }
  get docSolicitaField(): AbstractControl {
    return this.vendedorForm.get("docSolicita")!;
  }
  get motivoField(): AbstractControl {
    return this.vendedorForm.get("motivo")!;
  }
  get tipoAnulacionField(): AbstractControl {
    return this.vendedorForm.get("tipoAnulacion")!;
  }
  get codigoGeneracionRField(): AbstractControl {
    return this.vendedorForm.get("codigoGeneracionR")!;
  }
}
