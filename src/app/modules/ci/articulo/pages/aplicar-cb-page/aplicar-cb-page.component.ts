/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prefer-const */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  IResponseBeneficiario,
  IResponseCajaChica,
  IResponseCentroCosto,
  IResponseCentroCuenta,
  IResponseConceptoVale,
  IResponseDepartamento,
  IResponseDtesCp,
  IResponseSubTipo,
} from "../../model/articulo-api-model-interface";
import { ArticuloApiService } from "../../service/articulo-api.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-aplicar-cb-page",
  templateUrl: "./aplicar-cb-page.component.html",
  styleUrls: ["./aplicar-cb-page.component.scss"],
})
export class AplicarCbPageComponent {
  datoCp: IResponseDtesCp[] = [];
  formAplicarCB!: FormGroup;
  listDepartamento: IResponseDepartamento[] = [];
  listConcepto: IResponseConceptoVale[] = [];
  filterConcepto: IResponseConceptoVale[] = [];
  listBeneficiario: IResponseBeneficiario[] = [];
  listCajaChica: IResponseCajaChica[] = [];
  listTipoDoc: IResponseSubTipo[] = [];
  listCentroCuenta: IResponseCentroCuenta[] = [];
  listCentroCosto: IResponseCentroCosto[] = [];
  listConecpto: IResponseConceptoVale[] = [];
  saldo = 0;
  montop = 0;
  monotl = 0;

  //detalle
  subtotal = 0;
  fovial = 0;
  cotrans = 0;
  iva = 0;
  total = 0;
  btnAplicar = false;
  today = new Date();
  pipe = new DatePipe("en-US");
  consecutivo = 0;
  vale = 0;
  constructor(
    private _formBuider: FormBuilder,
    private _service: ArticuloApiService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public editData: any,
    private _dialogRef: MatDialogRef<AplicarCbPageComponent>,
    private _snotifyService: SnotifyService
  ) {
    this._loadFormGroup(),
      this._loadDepartamento(),
      this._lodadBeneficiario(),
      this._lodadConcepto(),
      this._loadCajaChica();
    this._loadDatos();
    this._loadCuentaContable();
  }
  private _loadFormGroup(): void {
    this.formAplicarCB = this._formBuider.group({
      consecutivo: [],
      estado: [],
      departamento: ["", [Validators.required]],
      concepto: ["", [Validators.required]],
      beneficionario: ["", [Validators.required]],
      ncf: [],
      emision: [],
      montoprovision: [],
      montoliquidacion: [],
      cajachica: ["", [Validators.required]],
      saldo: [],
      //detalle 1
      fechadoc: [],
      tipoDoc: [],
      nit: [],
      impuesto: [],
      cuentaContable: ["", [Validators.required]],
      //detalle 2
      numeroDte: [],
      subtipoDoc: ["", [Validators.required]],
      proveedor: [],
      conceptod: ["", [Validators.required]],
      centrocosto: ["", [Validators.required]],
      //detalle 3
      subtotal: [],
      fovial: [],
      cotrans: [],
      iva: [],
      total: [],
      detalle: ["", [Validators.required]],
    });
  }

  private _loadCuentaContable(): void {
    this._service.getCuentaContable().subscribe({
      next: (response) => {
        this.listCentroCuenta = response.result;
      },
    });
  }
  private _loadDatos(): void {
    const d = new Date();
    const n = d.getFullYear();
    const hoy = this.pipe.transform(this.today, "dd/MM/YYYY");
    this._service.getDteCp(this.editData.Dte_Id as number).subscribe({
      next: (response) => {
        this.datoCp = response.result;
        //datalle 1
        this.formAplicarCB.controls["fechadoc"].setValue(
          this.datoCp[0].fechaDoc
        );
        this.formAplicarCB.controls["tipoDoc"].setValue(this.datoCp[0].TipoDoc);
        this.formAplicarCB.controls["nit"].setValue(this.editData.Documento);
        this.formAplicarCB.controls["impuesto"].setValue(
          this.datoCp[0].codigoImpuesto
        );
        //detalle 2
        this.formAplicarCB.controls["numeroDte"].setValue(this.datoCp[0].dte);
        this.cargaSubtipo(this.datoCp[0].subTipoDoc);
        this.formAplicarCB.controls["proveedor"].setValue(
          this.datoCp[0].nombre
        );

        this.formAplicarCB.controls["montoprovision"].setValue(
          this.datoCp[0].monto
        );
        this.formAplicarCB.controls["subtotal"].setValue(
          this.datoCp[0].subtotal
        );
        this.formAplicarCB.controls["fovial"].setValue(this.datoCp[0].fovial);
        this.formAplicarCB.controls["cotrans"].setValue(this.datoCp[0].cotrans);
        this.formAplicarCB.controls["iva"].setValue(this.datoCp[0].impuesto1);
        this.formAplicarCB.controls["total"].setValue(this.datoCp[0].monto);
        this.formAplicarCB.controls["detalle"].setValue(
          this.datoCp[0].selloRecibido
        );
        this.formAplicarCB.controls["emision"].setValue(hoy);
      },
    });
  }

  private cargaSubtipo(id: string): void {
    this._service.getSubTipoCp(id).subscribe({
      next: (response) => {
        this.listTipoDoc = response.result;
      },
    });
  }
  private _loadDepartamento(): void {
    this._service.getDepartamento().subscribe({
      next: (response) => {
        this.listDepartamento = response.result;
      },
    });
  }
  private _loadCajaChica(): void {
    this._service.getCajaChica().subscribe({
      next: (response) => {
        this.listCajaChica = response.result;
      },
    });
  }

  onkey(event: any) {
    this.listCentroCuenta = this.filterCuenta(event.target.value);
    if (event.target.value == "") {
      this._loadCuentaContable();
    }
  }
  filterCuenta(value: string) {
    let filter = value.toLowerCase();
    return this.listCentroCuenta.filter((option: any) =>
      option.DESCRIPCION.toLowerCase().includes(filter)
    );
  }
  private _lodadConcepto(): void {
    this._service.getConcepto().subscribe({
      next: (response) => {
        this.listConcepto = response.result;
      },
    });
  }
  private _lodadBeneficiario(): void {
    this._service.getBeneficiario().subscribe({
      next: (response) => {
        this.listBeneficiario = response.result;
      },
    });
  }

  private _loadConcepto(): void {
    this._service.getConcepto().subscribe({
      next: (response) => {
        this.listConcepto = response.result;
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSaldo(caja: any): void {
    this.formAplicarCB
      .get("saldo")
      ?.setValue(
        this.listCajaChica.find((r) => r.CAJA_CHICA == caja)?.SALDO || 0
      );
  }

  selectionCuentaContable(cuentaContable: any): void {
    this._loadCuentaContable2(cuentaContable.value);
  }

  selectionConcepto(conpceto: any): void {
    this.formAplicarCB
      .get("cuentaContable")
      ?.setValue(
        this.listConcepto.find((r) => r.CONCEPTO_VALE == conpceto.value)
          ?.CUENTA_CONTABLE || ""
      );

    const cuenta = this.CuentaContableField.value as string;

    this._loadCuentaContable2(cuenta);
  }
  private _loadCuentaContable2(cuentaContable: string): void {
    this._service.getCentroCuenta2(cuentaContable).subscribe({
      next: (response) => {
        this.listCentroCosto = response.result;
      },
    });
  }
  clickSave(): void {
    if (this.formAplicarCB.invalid) {
      this._snotifyService.error("Todos los campos son obligatorios", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    if (this.montop > this.saldo) {
      this._snotifyService.error(
        "La disponiblidad de la Caja es menor que el Vale",
        {
          position: SnotifyPosition.rightTop,
        }
      );
      return;
    }
    const data = {
      SALDO_CAJA: this.saldoField.value as number,
      DEPARTAMENTO: this.departamentoField.value as string,
      CAJA_CHICA: this.cajachicaField.value as string,
      FECHA_EMISION: this.convertiFecha(this.emisionField.value as string),
      CONCEPTO_VALE: this.conceptoField.value as string,
      BENEFICIARIO: this.beneficionarioField.value as string,
      MONTO_CAJA: this.montoprovisionField.value as number,
      MONTO_LOCAL: 0.0,
      MONTO_DOLAR: 0.0,
      TIPO_CAMB_CAJA: 1,
      TIPO_CAMB_DOLAR: 1,
      ESTADO: "L",
      USUARIO_CREACION: "SA",
      FECHA_CREACION: this.convertiFecha(this.emisionField.value as string),
      ADMIN_CREACION: this.beneficionarioField.value as string,
      USUARIO_MODIFIC: "SA",
      FECHA_MODIFIC: this.convertiFecha(this.emisionField.value as string),
      ADMIN_MODIFIC: this.beneficionarioField.value as string,
      MONTO_VALE: this.montoprovisionField.value as number,
      MONTO_EFECTIVO: 0,
      REINTEGRO: 0,
      FACTURA_ELECTONICA: "N",
      SUBTOTAL_BIENES: 0.0,
      SUBTOTAL_SERVICE: 0.0,
      DESTINO_ITBIS: "Por Adelantar",
      TIPO_CF: "NCF",
    };
    this._service.posVale(data).subscribe({
      next: (response) => {
        this.consecutivo = response.result[0].conse;
        this.vale = response.result[0].vale;
        this.formAplicarCB.controls["consecutivo"].setValue(this.vale);
        this.formAplicarCB.controls["estado"].setValue("Liquidado");
        this.guardarDocSoporte(this.consecutivo);
      },
    });
    //	console.log('data para el cuerpo de cajachica ', data);
  }

  private guardarDocSoporte(doc: any): void {
    const d = new Date();
    const n = d.getFullYear().toString().substr(2);
    const docsSoporte = {
      _vale: doc,
      _linea: 0,
      _centro_costo: this.CentroCostoField.value as string,
      _cuenta_contable: this.CuentaContableField.value as string,
      _nit: this.nitField.value as string,
      _doc_soporte: (this.dteField.value as string) + "-" + n,
      _tipo: this.tipoDocField.value as string,
      _monto: this.montoprovisionField.value as number,
      _monot_vale: this.montoprovisionField.value as number,
      _concepto: this.conceptodField.value as string,
      _detalle: this.detalleField.value as string,
      _subtotal: this.subTotalField.value as number,
      _impuesto1: this.ivaField.value as number,
      _impuesto2: 0.0,
      _rubro1: this.fovialField.value as number,
      _rubro2: this.cotransField.value as number,
      _descuento: 0.0,
      _subtipo: this.subtipoDocField.value as number,
      _fecha: this.convertiFecha(this.emisionField.value as string),
      _fecha_rigue: this.convertiFecha(this.emisionField.value as string),
      _codigo_impuesto: this.impuestoField.value as string,
      _base_impuesto1: this.subTotalField.value as string,
      _base_impuesto2: 0.0,
      _id: this.editData.Dte_Id,
      _origen: "JSON",
    };
    //guadarmos el detalle en doc_soporte

    this._service.posDocSoporte(docsSoporte).subscribe({
      next: (response) => {
        if (response.success) {
          this._snotifyService.success("Registro Guardado con Exito", {
            position: SnotifyPosition.rightTop,
          });
          this.btnAplicar = true;
        }
      },
    });
  }

  cerrar(): void {
    this._dialogRef.close("updateCH");
  }
  private convertiFecha(string: any) {
    var fecha = string.split("/");
    return fecha[2] + "/" + fecha[1] + "/" + fecha[0];
  }

  get impuestoField(): AbstractControl {
    return this.formAplicarCB.get("impuesto")!;
  }
  get montopField(): AbstractControl {
    return this.formAplicarCB.get("montop")!;
  }
  get subtipoDocField(): AbstractControl {
    return this.formAplicarCB.get("subtipoDoc")!;
  }
  get fovialField(): AbstractControl {
    return this.formAplicarCB.get("fovial")!;
  }
  get cotransField(): AbstractControl {
    return this.formAplicarCB.get("cotrans")!;
  }
  get ivaField(): AbstractControl {
    return this.formAplicarCB.get("iva")!;
  }
  get subTotalField(): AbstractControl {
    return this.formAplicarCB.get("subtotal")!;
  }
  get tipoDocField(): AbstractControl {
    return this.formAplicarCB.get("tipoDoc")!;
  }
  get MontoField(): AbstractControl {
    return this.formAplicarCB.get("monto")!;
  }
  get CuentaContableField(): AbstractControl {
    return this.formAplicarCB.get("cuentaContable")!;
  }
  get detalleField(): AbstractControl {
    return this.formAplicarCB.get("detalle")!;
  }
  get CentroCostoField(): AbstractControl {
    return this.formAplicarCB.get("centrocosto")!;
  }
  get departamentoField(): AbstractControl {
    return this.formAplicarCB.get("departamento")!;
  }
  get cajachicaField(): AbstractControl {
    return this.formAplicarCB.get("cajachica")!;
  }
  get consecutivoField(): AbstractControl {
    return this.formAplicarCB.get("consecutivo")!;
  }

  get emisionField(): AbstractControl {
    return this.formAplicarCB.get("emision")!;
  }

  get conceptoField(): AbstractControl {
    return this.formAplicarCB.get("concepto")!;
  }
  get conceptodField(): AbstractControl {
    return this.formAplicarCB.get("conceptod")!;
  }
  get beneficionarioField(): AbstractControl {
    return this.formAplicarCB.get("beneficionario")!;
  }
  get montoprovisionField(): AbstractControl {
    return this.formAplicarCB.get("montoprovision")!;
  }
  get saldoField(): AbstractControl {
    return this.formAplicarCB.get("saldo")!;
  }
  get nitField(): AbstractControl {
    return this.formAplicarCB.get("nit")!;
  }
  get dteField(): AbstractControl {
    return this.formAplicarCB.get("numeroDte")!;
  }
}
