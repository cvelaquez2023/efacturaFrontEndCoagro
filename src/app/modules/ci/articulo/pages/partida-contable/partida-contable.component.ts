/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {
  IResponseAsientoLinea,
  IResponseCentroCosto,
  IResponseCentroCuenta,
} from "../../model/articulo-api-model-interface";
import { ArticuloApiService } from "../../service/articulo-api.service";
import { CurrencyPipe } from "@angular/common";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

@Component({
  selector: "app-partida-contable",
  templateUrl: "./partida-contable.component.html",
  styleUrls: ["./partida-contable.component.scss"],
})
export class PartidaContableComponent {
  listCentroCuenta: IResponseCentroCuenta[] = [];
  listCentroCosto: IResponseCentroCosto[] = [];
  credito = 0;
  debito = 0;

  constructor(
    private _formBuilder: FormBuilder,
    private _servicioApi: ArticuloApiService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public ediData: any,
    private _dialogRef: MatDialogRef<PartidaContableComponent>,
    private _snotifyService: SnotifyService
  ) {
    this._loadFormGroup();
    this._loadCentroCosto();
  }

  FormPartidad!: FormGroup;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  actionBtn: string = "Guardar";

  private _loadFormGroup(): void {
    this.FormPartidad = this._formBuilder.group({
      asiento: [],
      centroCosto: ["", [Validators.required]],
      cuentaContable: ["", [Validators.required]],
      fuente: ["", [Validators.required]],
      referencia: ["", [Validators.required]],
      creditoLocal: [""],
      debitoLocal: [""],
    });

    if (this.ediData.CONSECUTIVO) {
      this.actionBtn = "Editar";
      this.FormPartidad.controls["asiento"].setValue(this.ediData.ASIENTO);
      this.FormPartidad.controls["centroCosto"].setValue(
        this.ediData.CENTRO_COSTO
      );
      this.FormPartidad.controls["cuentaContable"].setValue(
        this.ediData.CUENTA_CONTABLE
      );
      this.FormPartidad.controls["referencia"].setValue(
        this.ediData.REFERENCIA
      );
      this.FormPartidad.controls["fuente"].setValue(this.ediData.FUENTE);
      this.FormPartidad.controls["creditoLocal"].setValue(
        this.ediData.CREDITO_LOCAL
      );
      this.FormPartidad.controls["debitoLocal"].setValue(
        this.ediData.DEBITO_LOCAL
      );
      this.credito = this.ediData.CREDITO_LOCAL;
      this.debito = this.ediData.DEBITO_LOCAL;
    } else {
      this.actionBtn = "Guardar";

      this.FormPartidad.controls["asiento"].setValue(this.ediData.ASIENTO);
      this.FormPartidad.controls["referencia"].setValue(
        this.ediData.REFERENCIA
      );
      this.FormPartidad.controls["fuente"].setValue(this.ediData.FUENTE);
    }

    this._loadCuentaContable(this.ediData.CENTRO_COSTO);
  }
  private _loadCentroCosto(): void {
    this._servicioApi.getCentroCosto().subscribe({
      next: (response) => {
        this.listCentroCosto = response.result;
      },
    });
  }
  selectionCentroCosto(centroCosto: any): void {
    this._loadCuentaContable(centroCosto.value);
  }
  private _loadCuentaContable(centro_costo: string): void {
    this._servicioApi.getCentroCuenta(centro_costo).subscribe({
      next: (response) => {
        this.listCentroCuenta = response.result;
      },
    });
  }

  onkey(event: any) {
    this.listCentroCuenta = this.filterCuenta(event.targe.value);
    if (event.target.value == "") {
      this._loadCuentaContable(this.centroCostoField.value as string);
    }
  }
  filterCuenta(value: string) {
    let filter = value.toLowerCase();
    return this.listCentroCuenta.filter((option: any) =>
      option.DESCRIPCION.toLowerCase().includes(filter)
    );
  }
  selectionCuentaContable(): void {
    this._loadCuentaContable(this.centroCostoField.value as string);
  }
  clickSave(): void {
    if (this.FormPartidad.invalid) {
      this._snotifyService.error("Todos los datos son Obligatorios", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }

    if (this.credito === 0 && this.debito === 0) {
      this._snotifyService.error(
        "No puede quedar a Cero en el Credito o Debito",
        {
          position: SnotifyPosition.rightTop,
        }
      );
      return;
    }
    if (this.actionBtn === "Editar") {
      const data = {
        asiento: this.asientoField.value as string,
        consecutivo: this.ediData.CONSECUTIVO,
        centroCosto: this.centroCostoField.value as string,
        cuentaContable: this.cuentaContableField.value as string,
        fuente: this.fuenteField.value as string,
        referencia: this.referenciaField.value as string,
        debito: this.debitoLocalField.value as number,
        credito: this.creditoLocalField.value as number,
      };
      this.actualizar(data);
    }
    if (this.actionBtn === "Guardar") {
      const data = {
        asiento: this.asientoField.value as string,
        centroCosto: this.centroCostoField.value as string,
        cuentaContable: this.cuentaContableField.value as string,
        fuente: this.fuenteField.value as string,
        referencia: this.referenciaField.value as string,
        debito: this.debitoLocalField.value as number,
        credito: this.creditoLocalField.value as number,
      };
      this.guardar(data);
    }
  }
  guardar(dataGUardar: any): void {
    console.log(dataGUardar);
    this._servicioApi.posDiarioLinea(dataGUardar).subscribe({
      next: (response) => {
        if (response.success) {
          this._snotifyService.info("Se adiciono con  exito", {
            position: SnotifyPosition.rightTop,
          });
          this._dialogRef.close("save");
        } else {
          this._snotifyService.warning("Existe un Problema", {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  actualizar(dataEdit: any): void {
    this._servicioApi.posDiario(dataEdit).subscribe({
      next: (response) => {
        if (response.success) {
          if (response.result[0] > 0) {
            this._snotifyService.info("La actualizacion se realizo con exito", {
              position: SnotifyPosition.rightTop,
            });
            this._dialogRef.close("update");
          } else {
            this._snotifyService.info("No se realizo la actualizacion ", {
              position: SnotifyPosition.rightTop,
            });
          }
        } else {
          this._snotifyService.warning("Ocurrio un errro ", {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  changeCredito(credito: any): void {
    if (this.debito > 0 && this.credito > 0) {
      this._snotifyService.error("El Valor de Debito es Mayor", {
        position: SnotifyPosition.rightTop,
      });
      this.credito = 0;
    }
  }
  changeDebito(_debito: any): void {
    if (this.credito > 0 && this.debito > 0) {
      this._snotifyService.error("El Valor de Credito es Mayor", {
        position: SnotifyPosition.rightTop,
      });
      this.debito = 0;
    }
  }

  get asientoField(): AbstractControl {
    return this.FormPartidad.get("asiento")!;
  }

  get centroCostoField(): AbstractControl {
    return this.FormPartidad.get("centroCosto")!;
  }
  get cuentaContableField(): AbstractControl {
    return this.FormPartidad.get("cuentaContable")!;
  }
  get fuenteField(): AbstractControl {
    return this.FormPartidad.get("fuente")!;
  }
  get referenciaField(): AbstractControl {
    return this.FormPartidad.get("referencia")!;
  }

  get creditoLocalField(): AbstractControl {
    return this.FormPartidad.get("creditoLocal")!;
  }
  get debitoLocalField(): AbstractControl {
    return this.FormPartidad.get("debitoLocal")!;
  }
}
