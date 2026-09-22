/* eslint-disable @typescript-eslint/no-explicit-any */
import { ViewChild } from "@angular/core";
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  IResponseDtesCp,
  IResponseMoneda,
  IResponseCondPago,
  IResponseSubTipo,
  IResponseAsientoLinea,
} from "./../../model/articulo-api-model-interface";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */

import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ArticuloApiService } from "../../service/articulo-api.service";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { IResponseTipoImpuesto } from "@app/modules/as/tablas/tipos/tipo-impuesto/models/tipoImpuesto_api_model_interface";
import { PartidaContableComponent } from "../partida-contable/partida-contable.component";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { SnotifyPosition, SnotifyService } from "ng-snotify";

interface Transaction {
  item: string;
  cost: number;
}
@Component({
  selector: "app-aplicar-cp-page",
  templateUrl: "./aplicar-cp-page.component.html",
  styleUrls: ["./aplicar-cp-page.component.scss"],
})
export class AplicarCpPageComponent {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  datoCp: IResponseDtesCp[] = [];
  listImpuesto: IResponseTipoImpuesto[] = [];
  listMoneda: IResponseMoneda[] = [];
  listCondPago: IResponseCondPago[] = [];
  listTipoDoc: IResponseSubTipo[] = [];
  listLineaAsientos2: IResponseAsientoLinea[] = [];
  dteAplicarCP!: FormGroup;
  value = 0;
  iva = 0;
  impuesto2 = 0;
  fovial = 0;
  cotrans = 0;
  montoTotal = 0;
  debito = 0;
  credito = 0;
  selectedIndex = 0;
  activa = true;
  btnAplicar = false;
  _asiento = "";
  referecnia = "";
  fuente = "";
  constructor(
    private _formBuilder: FormBuilder,
    private _serviceApi: ArticuloApiService,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @Inject(MAT_DIALOG_DATA) public editData: any,
    private _dialogRef: MatDialogRef<AplicarCpPageComponent>,
    private dialog: MatDialog,
    private _snotifyService: SnotifyService
  ) {
    this._loadFormGroup(),
      this.cargaDato(),
      this.cargaImpuesto(),
      this.cargaMoneda(),
      this.cargaCondPago();
  }

  listLineaAsientos = new MatTableDataSource<IResponseAsientoLinea>();

  //displayedColumns: string[] = ['item', 'cost'];

  displayedColumns: string[] = [
    "consecutivo",
    "centroCosto",
    "cuentaContable",
    "fuente",
    "referencia",
    "debitoLocal",
    "creditoLocal",
    "actions",
  ];

  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  searchKey!: "carlos";

  private cargaDato(): void {
    const d = new Date();
    const n = d.getFullYear().toString().substr(2);

    this._serviceApi.getDteCp(this.editData.Dte_Id as number).subscribe({
      next: (response) => {
        this.datoCp = response.result;

        this.dteAplicarCP.controls["dte"].setValue(
          this.datoCp[0].dte + "-" + n
        );
        this.dteAplicarCP.controls["monto"].setValue(this.datoCp[0].monto);
        this.dteAplicarCP.controls["fechaDoc"].setValue(
          this.datoCp[0].fechaDoc
        );
        this.dteAplicarCP.controls["fechaRige"].setValue(
          this.datoCp[0].fechaDoc
        );
        this.dteAplicarCP.controls["fechaVence"].setValue(
          this.datoCp[0].fechaVence
        );
        this.dteAplicarCP.controls["impuesto"].setValue(
          this.datoCp[0].codigoImpuesto
        );
        this.dteAplicarCP.controls["moneda"].setValue(this.datoCp[0].moneda);
        this.dteAplicarCP.controls["selloRecibido"].setValue(
          this.datoCp[0].selloRecibido
        );
        this.dteAplicarCP.controls["condPago"].setValue(
          this.datoCp[0].condicion_pago
        );
        this.dteAplicarCP.controls["tipoDoc"].setValue(this.datoCp[0].TipoDoc);
        this.dteAplicarCP.controls["subtotal"].setValue(
          this.datoCp[0].subtotal
        );
        this.dteAplicarCP.controls["iva"].setValue(this.datoCp[0].impuesto1);
        this.dteAplicarCP.controls["impuesto2"].setValue(
          this.datoCp[0].impuesto2
        );
        this.dteAplicarCP.controls["montoTotal"].setValue(this.datoCp[0].monto);

        this.cargaSubtipo(this.datoCp[0].subTipoDoc);
      },
    });
  }

  clickSave(): void {
    if (this.dteAplicarCP.invalid) {
      console.log("eerrrpr");
      return;
    }

    const data = {
      id: this.editData.Dte_Id,
      tipo: this.tipoDocField.value as string,
      fechaDocumento: this.convertiFecha(this.FechaDocField.value as string),
      fecha: this.convertiFecha(this.FechaRigueField.value as string),
      aplicacion: this.AplicacionField.value as string,
      condicionPago: this.CodPagoField.value as string,
      subtipo: this.SubTipoField.value as string,
      fechavence: this.convertiFecha(this.FechaVenceField.value as string),
      codigoImpuesto: this.ImpuestoField.value as string,
      notas: this.SelloRecibidoField.value as string,
    };

    this._serviceApi.posDocCp(data).subscribe({
      next: (response) => {
        if (response.success) {
          const datos = response.result;

          const asiento = response.result[0].ASIENTO;
          this.dteAplicarCP.controls["asiento"].setValue(asiento);
          this._asiento = asiento;
          const asientoLinea = response.result;
          this.fuente = asientoLinea[0].FUENTE;
          this.referecnia = asientoLinea[0].REFERENCIA;
          this.listLineaAsientos2 = asientoLinea;
          this.listLineaAsientos.data = asientoLinea;
          this.selectedIndex = 3;
          this.activa = false;
          this.btnAplicar = true;
        } else {
          console.log(response.errors);
          this._snotifyService.error(response.errors[0], {
            position: SnotifyPosition.rightTop,
          });
        }
      },
    });
  }

  cerrar(): void {
    this._dialogRef.close("updateCP");
  }
  getTotalCredito() {
    return this.listLineaAsientos2
      .map((t) => t.CREDITO_LOCAL)
      .reduce((acc, value) => acc + value, 0);
  }
  getTotalDebito() {
    return this.listLineaAsientos2
      .map((t) => t.DEBITO_LOCAL)
      .reduce((acc, value) => acc + value, 0);
  }
  private convertiFecha(string: any) {
    var fecha = string.split("/");
    return fecha[2] + "/" + fecha[1] + "/" + fecha[0];
  }

  clickAgregar(asiento: string): void {
    this.dialog
      .open(PartidaContableComponent, {
        width: "30%",
        data: {
          ASIENTO: asiento,
          FUENTE: this.fuente,
          REFERENCIA: this.referecnia,
        },
      })
      .afterClosed()
      .subscribe((val) => {
        if (val == "save") {
          this.cargarAsiento(this.AsientoField.value as string);
        }
      });
  }
  clickEdit(element: any): void {
    this.dialog
      .open(PartidaContableComponent, {
        width: "30%",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val == "update") {
          this.cargarAsiento(this.AsientoField.value as string);
        }
      });
  }

  cargarAsiento(asiento: string): void {
    this._serviceApi.getAsiento(asiento).subscribe({
      next: (response) => {
        this.listLineaAsientos.data = response.result;
        this.listLineaAsientos2 = response.result;
        this.cuadrePartida();
      },
    });
  }

  cuadrePartida(): void {
    const totalCredito = this.listLineaAsientos2
      .map((t) => t.CREDITO_LOCAL)
      .reduce((acc, value) => acc + value, 0);
    const totalDebito = this.listLineaAsientos2
      .map((t) => t.DEBITO_LOCAL)
      .reduce((acc, value) => acc + value, 0);
    if (totalCredito !== totalDebito) {
      this._snotifyService.error("La Partida esta Descuadrada", {
        position: SnotifyPosition.rightTop,
      });
    }
  }

  private cargaImpuesto(): void {
    this._serviceApi.getImpuestos().subscribe({
      next: (response) => {
        this.listImpuesto = response.result;
      },
    });
  }

  private cargaMoneda(): void {
    this._serviceApi.getMoneda().subscribe({
      next: (response) => {
        this.listMoneda = response.result;
      },
    });
  }
  private cargaCondPago(): void {
    this._serviceApi.getCondicionPagos().subscribe({
      next: (response) => {
        this.listCondPago = response.result;
      },
    });
  }
  private cargaSubtipo(id: string): void {
    this._serviceApi.getSubTipoCp(id).subscribe({
      next: (response) => {
        this.listTipoDoc = response.result;
      },
    });
  }
  private _loadFormGroup(): void {
    this.dteAplicarCP = this._formBuilder.group({
      tipoDoc: [],
      dte: [],
      monto: [],
      fechaDoc: [],
      fechaRige: [],
      fechaVence: [],
      impuesto: [],
      moneda: [],
      selloRecibido: [],
      condPago: [],
      subtipo: ["", [Validators.required]],
      aplicacion: ["", [Validators.required]],
      //tab de Detalle
      subtotal: [""],
      iva: [""],
      impuesto2: [0.0],
      fovial: [0.0],
      cotrans: [0.0],
      montoTotal: [""],
      asiento: [],
    });
  }
  selectIva(impuesto: any): void {
    console.log(impuesto.value);
  }

  clickDelete(id: number, asiento: string): void {
    this._snotifyService.confirm("Esta seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._serviceApi
              .deleteAsientoLinea(id, asiento)
              .subscribe((response) => {
                if (response.success) {
                  this._snotifyService.info("El registro ha sido Eliminado");
                  this.cargarAsiento(this.AsientoField.value as string);
                } else {
                  this._snotifyService.error(response.errors[0], {
                    position: SnotifyPosition.rightTop,
                  });
                }
              });
          },
        },
        {
          text: "CANCELAR",
        },
      ],
    });
  }
  get tipoDocField(): AbstractControl {
    return this.dteAplicarCP.get("tipoDoc")!;
  }
  get DteField(): AbstractControl {
    return this.dteAplicarCP.get("dte")!;
  }

  get MontoField(): AbstractControl {
    return this.dteAplicarCP.get("monto")!;
  }
  get FechaDocField(): AbstractControl {
    return this.dteAplicarCP.get("fechaDoc")!;
  }
  get FechaRigueField(): AbstractControl {
    return this.dteAplicarCP.get("fechaRige")!;
  }
  get FechaVenceField(): AbstractControl {
    return this.dteAplicarCP.get("fechaVence")!;
  }
  get ImpuestoField(): AbstractControl {
    return this.dteAplicarCP.get("impuesto")!;
  }
  get MonedaField(): AbstractControl {
    return this.dteAplicarCP.get("moneda")!;
  }
  get SelloRecibidoField(): AbstractControl {
    return this.dteAplicarCP.get("selloRecibido")!;
  }
  get CodPagoField(): AbstractControl {
    return this.dteAplicarCP.get("condPago")!;
  }
  get SubTipoField(): AbstractControl {
    return this.dteAplicarCP.get("subtipo")!;
  }
  get AplicacionField(): AbstractControl {
    return this.dteAplicarCP.get("aplicacion")!;
  }
  get SubTotalField(): AbstractControl {
    return this.dteAplicarCP.get("subtotal")!;
  }
  get IvaField(): AbstractControl {
    return this.dteAplicarCP.get("iva")!;
  }
  get Impuesto2Field(): AbstractControl {
    return this.dteAplicarCP.get("impuesto2")!;
  }
  get FovialField(): AbstractControl {
    return this.dteAplicarCP.get("fovial")!;
  }
  get CotransField(): AbstractControl {
    return this.dteAplicarCP.get("cotrans")!;
  }
  get MontoTotalField(): AbstractControl {
    return this.dteAplicarCP.get("montoTotal")!;
  }
  get AsientoField(): AbstractControl {
    return this.dteAplicarCP.get("asiento")!;
  }
}
