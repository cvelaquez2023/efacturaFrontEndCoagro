import { Component, Inject, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import {
  IHandheldConfig,
  IHandheldConfigDialogData,
} from "../../model/handheld-config-model";

@Component({
  selector: "app-config-handheld",
  templateUrl: "./config-handheld.component.html",
  styleUrls: ["./config-handheld.component.scss"],
})
export class ConfigHandheldComponent implements OnDestroy {
  configForm!: FormGroup;
  private _subs = new Subscription();

  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: IHandheldConfigDialogData,
    private _dialogRef: MatDialogRef<ConfigHandheldComponent>
  ) {
    const c = data.config;
    this.configForm = this._formBuilder.group({
      simboloMonetario: [c.simboloMonetario, [Validators.required, Validators.maxLength(5)]],
      nombreArchivoBitacora: [c.nombreArchivoBitacora, [Validators.required, Validators.maxLength(100)]],
      registroMultipleDocumento: [c.registroMultipleDocumento, Validators.required],
      cantidadDecimales: [c.cantidadDecimales, [Validators.required, Validators.min(0), Validators.max(6)]],
      tamanoLetra: [c.tamanoLetra, [Validators.required, Validators.min(6), Validators.max(24)]],
      decimalesUnidades: [c.decimalesUnidades, [Validators.required, Validators.min(0), Validators.max(6)]],

      limpiarFiltroArticulos: [c.limpiarFiltroArticulos],
      infoDescuentosVencida: [c.infoDescuentosVencida],
      seleccionAutomaticaCliente: [c.seleccionAutomaticaCliente],
      busquedaAgilCliente: [c.busquedaAgilCliente],
      ordenarArticuloCriterio: [c.ordenarArticuloCriterio],
      ordenarArticuloIndice: [c.ordenarArticuloIndice],
      advertirActualizacion: [c.advertirActualizacion],

      purgaAutomatica: [c.purgaAutomatica],
      purgaManual: [c.purgaManual],
      purgaDias: [c.purgaDias, [Validators.required, Validators.min(1), Validators.max(365)]],

      gpsUbicacionVisita: [c.gpsUbicacionVisita],
      gpsUbicacionCliente: [c.gpsUbicacionCliente],
      gpsActualizarUbicacionCliente: [c.gpsActualizarUbicacionCliente],
      gpsNoDetenerProceso: [c.gpsNoDetenerProceso],
      gpsDistancia: [c.gpsDistancia, [Validators.required, Validators.min(0)]],
    });

    // "Cantidad Días" solo aplica a la purga automática (igual que en Softland).
    this._togglePurgaDias(c.purgaAutomatica);
    this._subs.add(
      this.configForm
        .get("purgaAutomatica")!
        .valueChanges.subscribe((v: boolean) => this._togglePurgaDias(v))
    );
  }

  private _togglePurgaDias(activa: boolean): void {
    const ctrl = this.configForm.get("purgaDias")!;
    activa ? ctrl.enable({ emitEvent: false }) : ctrl.disable({ emitEvent: false });
  }

  hasError(campo: string): boolean {
    const ctrl = this.configForm.get(campo);
    return !!ctrl && ctrl.invalid;
  }

  clickAceptar(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }
    const v = this.configForm.getRawValue();
    const config: IHandheldConfig = {
      ...v,
      simboloMonetario: (v.simboloMonetario || "").trim(),
      nombreArchivoBitacora: (v.nombreArchivoBitacora || "").trim(),
      cantidadDecimales: Number(v.cantidadDecimales),
      tamanoLetra: Number(v.tamanoLetra),
      decimalesUnidades: Number(v.decimalesUnidades),
      purgaDias: Number(v.purgaDias),
      gpsDistancia: Number(v.gpsDistancia),
    };
    this._dialogRef.close(config);
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
