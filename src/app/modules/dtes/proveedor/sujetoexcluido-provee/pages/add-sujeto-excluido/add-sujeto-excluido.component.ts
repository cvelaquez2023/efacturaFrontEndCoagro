/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SujetoexcluidoProveedorService } from "./../../services/sujetoexcluido-proveedor.service";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Inject, OnInit } from "@angular/core";
import { validateBasis } from "@angular/flex-layout";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { IProveedorBusqueda } from "@app/modules/as/tablas/funcionarios/vendedores/services/vendedor-api-model-interface";
import { BuscarProveedorComponent } from "../buscar-proveedor/buscar-proveedor.component";
import { VendedorApiService } from "@app/modules/as/tablas/funcionarios/vendedores/services/vendedor-api.service";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { IDireccionMh, IResponseDTE14 } from "../../model/sujetoExcluido_DTE_interface";

@Component({
  selector: "app-add-sujeto-excluido",
  templateUrl: "./add-sujeto-excluido.component.html",
  styleUrls: ["./add-sujeto-excluido.component.scss"],
})
export class AddSujetoExcluidoComponent {
  /** Retención de renta a sujetos excluidos (10 %). */
  static readonly PORCENTAJE_RENTA = 0.1;
  /** Formato moneda: $ 11,000.00 (el control guarda el número, sin símbolo ni comas). */
  readonly opcionesMoneda = {
    prefix: "$ ",
    thousands: ",",
    decimal: ".",
    precision: 2,
    align: "left",
    allowNegative: false,
  };

  vendedorForm!: FormGroup;
  _dui: string = "";
  _fecha = new Date();
  _dte: string = "";
  guardar = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proveedor: any;
  /** Dirección del proveedor en formato MH v2 (columnas _MH de dte_proveedor). */
  direccionMh: IDireccionMh | null = null;
  /**
   * Aviso cuando el proveedor no tiene los datos que exige el DTE v2 (ej. "SIN DISTRITO").
   * No bloquea: mientras la empresa siga en v1 el documento se emite igual.
   */
  avisoV2 = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueChange: any;
  constructor(
    private _formBuilder: FormBuilder,
    private _vendedorApiService: VendedorApiService,
    private _sujetoExcluidoApiService: SujetoexcluidoProveedorService,
    private _snotifyService: SnotifyService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public ediData: any,
    private _dialogRef: MatDialogRef<AddSujetoExcluidoComponent>,
    private _dialog: MatDialog
  ) {
    this._loadFormGroup();
  }

  private _loadFormGroup(): void {
    this.vendedorForm = this._formBuilder.group({
      DUI: ["", Validators.required],
      nombre: [""],
      correo: [""],
      departamento: [""],
      municipio: [""],
      distrito: [""],
      direccion: [""],
      telefono: [""],
      aplicacion: ["", Validators.required],
      monto: [0.0, Validators.required],
      renta: [0.0],
      total: [0.0],
      aplica: [true, Validators.required],
      fecha: ["", Validators.required],
    });
    // Renta y total se recalculan al cambiar el monto o el check "Aplica Renta".
    this.montoField.valueChanges.subscribe(() => this._calcular());
    this.aplicaField.valueChanges.subscribe(() => this._calcular());
  }

  /** Redondeo a centavos (evita 1100.0000000002 y similares). */
  private _redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  /** Texto recortado, o null si queda vacío o no llega al mínimo de caracteres (reglas del esquema MH v2). */
  private _textoMh(valor: unknown, minimo: number, maximo: number): string | null {
    const texto = String(valor ?? "").trim();
    return texto.length >= minimo ? texto.slice(0, maximo) : null;
  }

  /** Correo válido para MH (6..100 y con "@"), o null. */
  private _correoMh(valor: unknown): string | null {
    const correo = this._textoMh(valor, 6, 100);
    return correo && correo.indexOf("@") > 0 ? correo : null;
  }

  /** Últimos 2 dígitos de un código del ERP ("0614" -> "14"), o null. */
  private _codigoMh(valor: unknown): string | null {
    const texto = String(valor ?? "").trim();
    return texto ? texto.slice(-2) : null;
  }

  /** Borra los datos del proveedor anterior (al cambiar de DUI o si no se encuentra). */
  private _limpiarProveedor(): void {
    this.proveedor = null;
    this.direccionMh = null;
    this.avisoV2 = "";
    this.vendedorForm.patchValue({
      nombre: "",
      direccion: "",
      departamento: "",
      municipio: "",
      distrito: "",
      telefono: "",
      correo: "",
    });
  }

  /** Monto como número (el control puede traer número o, por si acaso, texto con $ y comas). */
  private _numero(valor: unknown): number {
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    const n = parseFloat(String(valor ?? "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  /** Renta = 10 % del monto (si aplica); total a pagar = monto − renta. */
  private _calcular(): void {
    const monto = this._numero(this.montoField.value);
    const renta = this.aplicaField.value ? this._redondear(monto * AddSujetoExcluidoComponent.PORCENTAJE_RENTA) : 0;
    const total = this._redondear(monto - renta);
    this.rentaField.setValue(renta, { emitEvent: false });
    this.totalField.setValue(total, { emitEvent: false });
  }

  clickSave(): void {
    if (this.vendedorForm.invalid) {
      this._snotifyService.error("Lo campos son Obligatorios", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    if (this._numero(this.totalField.value) <= 0) {
      this._snotifyService.error("El total tiene que ser Mayor a Cero", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }

    this._sujetoExcluidoApiService.getConsecutivo("DTE14").subscribe({
      next: (response) => {
        if (response.success === true) {
          this._dte = response.result[0].ULTIMO_VALOR;
          let tipo = "";
          let doc = this.duiField.value;
          if (doc.length <= 10) {
            tipo = "13";
          } else {
            tipo = "36";
          }
          // Valores numéricos del formulario (antes se leía el texto "$1,100.00" y parseFloat cortaba en la coma).
          const monto = this._redondear(this._numero(this.montoField.value));
          const renta = this._redondear(this._numero(this.rentaField.value));
          const total = this._redondear(monto - renta);
          const data: IResponseDTE14 = {
            tipoDocumento: "13",
            numDocumento: this.duiField.value,
            nombre: this.nombreField.value,
            // Departamento y municipio igual que siempre (v1); el distrito solo lo usa el backend en v2.
            direccion: {
              departamento: this.departamentoField.value,
              municipio: this.municipioField.value,
              distrito: this.direccionMh?.distrito ?? null,
              complemento: this.direcionField.value,
            },
            direccionMh: this.direccionMh,
            // v2 acepta null pero no textos vacíos o cortos
            telefono: this._textoMh(this.proveedor?.TELEFONO_MH ?? this.telefonoField.value, 8, 30),
            correo: this._correoMh(this.proveedor?.CORREO_MH ?? this.correoField.value),
            aplicacion: {
              descripcion: this.aplicacionField.value,
              monto: monto,
              renta: renta,
              total: total,
              fecha: this.fechaField.value,
              dte: this._dte,
            },
            hacienda: "N",
            origen: "CP",
          };

          this.enviarData(data);
        }
      },
    });

    //enviamos a api
  }

  private enviarData(data: IResponseDTE14): void {
    this._sujetoExcluidoApiService.postEnvioDTE(data).subscribe({
      next: (response) => {
        if (response.success === true) {
          this._snotifyService.info("El registro se guardo sin problema", {
            position: SnotifyPosition.rightTop,
          });
          this.guardar = true;
          this.actualizarCorrelativo();

          this._dialogRef.close("save");
        } else {
          this._snotifyService.error("Existio un problemas", {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }
  //actualziamos correlativo
  private actualizarCorrelativo(): void {
    this._sujetoExcluidoApiService.postConsecutivo("DTE14").subscribe({
      next: (response) => {
        const guar = "se guarda sin problema";
      },
    });
  }
  /** Lupa: abre el buscador de proveedores y carga el elegido. */
  abrirBuscador(): void {
    this._dialog
      .open(BuscarProveedorComponent, {
        width: "620px",
        maxWidth: "95vw",
        autoFocus: true,
        data: { texto: String(this.duiField.value ?? "").trim() },
      })
      .afterClosed()
      .subscribe((p?: IProveedorBusqueda) => {
        if (!p) return;
        const doc = String(p.CONTRIBUYENTE ?? "").trim();
        if (!doc) {
          this._snotifyService.warning(
            `El proveedor ${p.PROVEEDOR} · ${p.NOMBRE} no tiene DUI/NIT (contribuyente) en el ERP`,
            { position: SnotifyPosition.rightTop }
          );
          return;
        }
        this._dui = doc;
        this.duiField.setValue(doc);
        this.onChangeDui(null, p);
      });
  }

  /**
   * Carga los datos del proveedor por su DUI/NIT. `elegido` es la fila de la lupa: si el ERP no
   * devuelve el detalle, al menos se llenan nombre y documento con ella.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  onChangeDui($event: any, elegido?: IProveedorBusqueda) {
    this._dui = String(this._dui ?? "").trim();
    if (!this._dui) return;
    this._vendedorApiService.getproveedor(this._dui).subscribe({
      next: (respose) => {
        this._limpiarProveedor();
        if (respose.success == true) {
          this.proveedor = respose.result[0];
          const p = this.proveedor;
          // Formato MH v2: columnas _MH del procedimiento; si aún no existen, se derivan del ERP.
          this.direccionMh = {
            departamento: p.DEPTO_MH ?? (String(p.DIVISION_GEOGRAFICA1 ?? "").trim() || null),
            municipio: p.MUNI_MH ?? this._codigoMh(p.DIVISION_GEOGRAFICA2),
            distrito: p.DISTRITO_MH ?? this._codigoMh(p.DIVISION_GEOGRAFICA3),
            complemento: p.DIRECCION_MH ?? this._textoMh(String(p.DIRECCION ?? "").replace("DETALLE:", ""), 1, 200),
          };
          this.vendedorForm.controls["distrito"].setValue(this.direccionMh.distrito ?? "");
          this.avisoV2 =
            p.PROBLEMA_MH ||
            (!this.direccionMh.distrito ? "SIN DISTRITO" : !this.direccionMh.complemento ? "SIN DIRECCION" : "");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const dire = this.proveedor.DIRECCION;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const dir = dire.replace("DETALLE:", "");
          this.vendedorForm.controls["nombre"].setValue(this.proveedor.NOMBRE);
          this.vendedorForm.controls["direccion"].setValue(dir);
          this.vendedorForm.controls["departamento"].setValue(
            this.proveedor.DIVISION_GEOGRAFICA1
          );
          this.vendedorForm.controls["municipio"].setValue(
            this.proveedor.DIVISION_GEOGRAFICA2
          );
          this.vendedorForm.controls["telefono"].setValue(
            this.proveedor.TELEFONO1
          );
          this.vendedorForm.controls["correo"].setValue(this.proveedor.E_MAIL);
        } else if (elegido) {
          this.vendedorForm.controls["nombre"].setValue(elegido.NOMBRE);
          this._snotifyService.warning("No se encontró el detalle (dirección, teléfono) del proveedor elegido", {
            position: SnotifyPosition.rightTop,
          });
        } else {
          this._snotifyService.error("Proveedor No Existe", {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  get duiField(): AbstractControl {
    return this.vendedorForm.get("DUI")!;
  }
  get nombreField(): AbstractControl {
    return this.vendedorForm.get("nombre")!;
  }
  get direcionField(): AbstractControl {
    return this.vendedorForm.get("direccion")!;
  }
  get departamentoField(): AbstractControl {
    return this.vendedorForm.get("departamento")!;
  }
  get municipioField(): AbstractControl {
    return this.vendedorForm.get("municipio")!;
  }
  get telefonoField(): AbstractControl {
    return this.vendedorForm.get("telefono")!;
  }
  get correoField(): AbstractControl {
    return this.vendedorForm.get("correo")!;
  }
  get aplicacionField(): AbstractControl {
    return this.vendedorForm.get("aplicacion")!;
  }
  get montoField(): AbstractControl {
    return this.vendedorForm.get("monto")!;
  }
  get rentaField(): AbstractControl {
    return this.vendedorForm.get("renta")!;
  }
  get aplicaField(): AbstractControl {
    return this.vendedorForm.get("aplica")!;
  }
  get fechaField(): AbstractControl {
    return this.vendedorForm.get("fecha")!;
  }
  get totalField(): AbstractControl {
    return this.vendedorForm.get("total")!;
  }
}
