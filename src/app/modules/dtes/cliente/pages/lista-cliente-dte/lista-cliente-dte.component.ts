import { SessionStorageService } from "./../../../../../services/local/storage/storage.service";
import { UserApiService } from "@app/modules/auth/services/api/user-api.service";
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClienteDteApiService } from "./../../service/cliente-dte-api.service";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {
  IResponseDtes,
  ITicketPdf,
} from "@app/modules/ci/articulo/model/articulo-api-model-interface";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { ListaObservacionesComponent } from "../lista-observaciones/lista-observaciones.component";
import { strict } from "assert";
import { EnvioEmailComponent } from "../envio-email/envio-email.component";
import generatePDF from "../../pdf/ticketPdf";
import TicketPDF from "../../pdf/ticketPdf";
interface Opcion {
  value: string;
}

@Component({
  selector: "app-lista-cliente-dte",
  templateUrl: "./lista-cliente-dte.component.html",
  styleUrls: ["./lista-cliente-dte.component.scss"],
})
export class ListaClienteDteComponent implements OnInit, AfterViewInit {
  selectedCar!: string;
  selectedAno!: string;

  mes = new Date().getMonth() + 1;
  years: Opcion[] = [];
  now: Date = new Date();
  fechaI!: string;
  fechaHoy!: "2024-01-01";
  actualYear: number = this.now.getFullYear();
  yearsSelected: string[] = [
    (this.actualYear - 4).toString(),
    (this.actualYear - 3).toString(),
    (this.actualYear - 2).toString(),
    (this.actualYear - 1).toString(),
    this.actualYear.toString(),
  ];

  formGroup!: FormGroup;
  datoUsuario!: any;
  //mes = this.hoy.getMonth.toString();
  constructor(
    private _snotifyService: SnotifyService,
    private _dteApiService: ClienteDteApiService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _sessionStorageService: SessionStorageService
  ) {
    this.selectedCar = this.mes.toString();
    this.selectedAno = this.actualYear.toString();
    let mesCompleto = "";
    if (this.mes > 9) {
      mesCompleto = this.mes.toString();
    } else {
      const newMes = this.mes.toString();
      mesCompleto = newMes.toString().padStart(2, "0");
    }
    this.fechaI = this.actualYear + "-" + mesCompleto + "/" + "01";
  }

  listaDocumentos = new MatTableDataSource<IResponseDtes>();
  displayedColumns: string[] = [
    "fechaEmision",
    "tipoDte",
    "numeroControl",
    "selloRecibido",
    "estado",
    "nombreEmisor",
    "documentoEmisor",
    "montoTotal",
    "actions",
  ];
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  //searchKey!: 'carlos';
  ngOnInit(): void {
    this._loadFormGroup();

    this.getYears();

    /*
		setInterval(() => {
			this._loadDoc('2023', '12');
		}, 20000);
	*/
    this.datoUsuario = this._sessionStorageService.getItem("data_user");
    console.log(this.datoUsuario.empresa);
  }
  getYears() {
    let year = new Date().getFullYear();
    let yearant = year - 5;
    for (let i = yearant; i <= year; i++) {
      this.years.push({ value: i.toString() });
    }
  }
  private _loadDoc(ano: string, mes: string): void {
    this._dteApiService.getDte(ano, mes).subscribe({
      next: (response) => {
        this.listaDocumentos.data = response.result;
      },
      error: (error) => {
        console.log("er", error);
      },
    });
  }

  private _loadFormGroup(): void {
    this.formGroup = this._formBuilder.group({
      ano: [],
      mes: [],
      fechaInicial: ["", [Validators.required]],
    });
    this.formGroup.controls["mes"].setValue(this.mes);
    this.formGroup.controls["ano"].setValue(this.actualYear);
    //	this.formGroup.controls['fechaInicial'].setValue('01/01/2024');
    this.formGroup.value.fechaInicial = "1/1/2024";
    this._loadDoc(this.anoField.value as string, this.mesField.value as string);
  }
  ngAfterViewInit(): void {
    this.listaDocumentos.paginator = this.paginator;
    this.listaDocumentos.sort = this.sort;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaDocumentos.filter = filterValue.trim().toLowerCase();
  }

  clickImprimir(element: any): void {
    this._dteApiService.getDteDescargar(element.Dte).subscribe((response) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let file = element.Dte + ".pdf";
      let fileNamae = response.headers
        .get("content-disposition")
        ?.split(";")[1]
        .split("=")[1];
      let bolb: Blob = response.body as Blob;
      let a = document.createElement("a");
      a.download = file;
      a.href = window.URL.createObjectURL(bolb);
      a.click();
    });
  }
  clickTicket(element: any): void {
    const dte = {
      dte: element.Dte,
      codigoGeneracion: element.codigoGeneracion,
      selloRecibido: element.selloRecibido,
      fechaProce: element.fechaProce,
      tipoDoc: element.tipoDoc,
      diasCredito: element.diasCredito,
      condicionPago: element.condicionPago,
      formaPago: element.formaPago,
      fechavence: element.fechavence,
    };
    const _produc: any[] = [];
    this._dteApiService.posticketPdf(element.Dte_Id).subscribe({
      next: (response) => {
        const receptor = response.result[0].receptor;
        const empresa = response.result[0].empresa;
        const lineas = response.result[0].linea;
        const resumen = response.result[0].resumen;
        const iva = response.result[0].iva;
        const cliente = response.result[0].cliente;
        const vendedor = response.result[0].vendedor;
        const documento = response.result[0].documento;

        for (let index = 0; index < lineas.length; index++) {
          const element = lineas[index];
          const dataItem = {
            bodega: element.bodega,
            nombre: element.nombre,
            cantidad: element.cantidad,
            unidad: "UND",
            precio: element.precioUni,
            descuento: element.montoDescu,
            porDesc: element.porDesc,
            total: element.totalLinea,
            lote: element.lote,
            fechaVence: element.fechaVence,
          };
          _produc.push(dataItem);
        }

        const resumenFixed = {
          ...resumen[0],
          totalLetras: String(resumen[0].totalLetras),
        };

        TicketPDF(
          empresa,
          receptor,
          _produc,
          [resumenFixed],
          dte,
          iva,
          cliente,
          vendedor,
          documento
        );
      },
    });
    /*
		const products = [
			{
				nombre: '15063-CREDELIO PLUS 56.25 MG CAJA X 3 TAB LOTE:AL159162E FECHA_VENCE:30-01-2027',
				cantidad: 1,
				unidad: 'UND',
				precio: 25.5,
				descuento: 0.76,
				total: 24.71
			},
			{
				nombre: '15065-CREDELIO PLUS 225 MG CAJA X 3 TAB LOTE:AL159161C FECHA_VENCE:31-01-2027',
				cantidad: 1,
				unidad: 'UND',
				precio: 28.6,
				descuento: 0.85,
				total: 27.75
			},
			{
				nombre: '22021-ENDAL PLUS 1 X 4 TAB LOTE:011/24 FECHA_VENCE:30-09-2026',
				cantidad: 1,
				unidad: 'UND',
				precio: 28.6,
				descuento: 0.85,
				total: 27.75
			}
		];
		*/
  }
  generaPdf(element: any): void {
    const data = {
      dte: element.Dte,
      tipoDoc: element.tipoDoc,
    };
    this._dteApiService.posReimprimirPdf(data).subscribe({
      next: (response) => {
        if (response.success === true) {
          this._snotifyService.info("Se genero PDF");
        } else {
          this._snotifyService.error("SE genera un Errro");
        }
      },
    });
  }

  clickCB(element: any): void {
    this._dialog
      .open(EnvioEmailComponent, {
        width: "30%",
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadDoc(
            this.anoField.value as string,
            this.mesField.value as string
          );
        }
      });
  }
  clickCH(element: any): void {
    this._dteApiService
      .postDteMh(element.Dte, this.datoUsuario.empresa)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this._snotifyService.info(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
            this._loadDoc(
              this.anoField.value as string,
              this.mesField.value as string
            );
          } else {
            this._snotifyService.error(response.errors[0], {
              position: SnotifyPosition.rightTop,
            });
          }
        },
        error: (error) => {
          console.log("er", error);
        },
      });
  }
  clickEdit(element: any): void {
    this._dialog
      .open(ListaObservacionesComponent, {
        width: "30%",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadDoc(
            this.anoField.value as string,
            this.mesField.value as string
          );
        }
      });
  }

  selectInicial(event: any): void {
    console.log(event.target.value);
  }
  selectMes(mes: string): void {
    this._loadDoc(this.anoField.value as string, mes);
  }
  selectAno(ano: string): void {
    this._loadDoc(ano, this.mesField.value as string);
  }
  get anoField(): AbstractControl {
    return this.formGroup.get("ano")!;
  }
  get mesField(): AbstractControl {
    return this.formGroup.get("mes")!;
  }
  get fechaInicialField(): AbstractControl {
    return this.formGroup.get("fechaInicial")!;
  }
}
