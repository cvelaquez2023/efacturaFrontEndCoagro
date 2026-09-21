import { DataUserService } from "./../../../../../services/local/data-user.service";
import { SessionStorageService } from "./../../../../../services/local/storage/storage.service";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";

import { SnotifyService, SnotifyPosition } from "ng-snotify";
import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";
import { ClienteDteApiService } from "@app/modules/dtes/cliente/service/cliente-dte-api.service";
import { IResponseDtes } from "@app/modules/ci/articulo/model/articulo-api-model-interface";
import { EnvioEmailComponent } from "@app/modules/dtes/cliente/pages/envio-email/envio-email.component";
import { ListaObservacionesComponent } from "@app/modules/dtes/cliente/pages/lista-observaciones/lista-observaciones.component";
interface Opcion {
  value: string;
}

@Component({
  selector: "app-lote-page",
  templateUrl: "./lote-page.component.html",
  styleUrls: ["./lote-page.component.scss"],
})
export class LotePageComponent implements OnInit, AfterViewInit {
  selectedCar!: string;
  selectedAno!: string;
  mes = new Date().getMonth() + 1;
  years: Opcion[] = [];
  now: Date = new Date();
  actualYear: number = this.now.getFullYear();
  datoUsuario!: any;
  yearsSelected: string[] = [
    (this.actualYear - 4).toString(),
    (this.actualYear - 3).toString(),
    (this.actualYear - 2).toString(),
    (this.actualYear - 1).toString(),
    this.actualYear.toString(),
  ];

  formGroup!: FormGroup;
  constructor(
    private _snotifyService: SnotifyService,
    private _dteApiService: ClienteDteApiService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _sessionStorageService: SessionStorageService
  ) {
    this.selectedCar = this.mes.toString();
    this.selectedAno = this.actualYear.toString();
  }
  listaDocumentos = new MatTableDataSource<IResponseDtes>();
  displayedColumns: string[] = [
    "fechaEmision",
    "tipoDte",
    "numeroControl",
    "modulo",
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
  searchKey!: "h2c";

  ngOnInit(): void {
    this._loadFormGroup();
    this.getYears();
    this.datoUsuario = this._sessionStorageService.getItem("data_user");
  }

  getYears() {
    let year = new Date().getFullYear();
    let yearant = year - 5;
    for (let i = yearant; i <= year; i++) {
      this.years.push({ value: i.toString() });
    }
  }
  private _loadDoc(ano: string, mes: string): void {
    this._dteApiService.getProveedor(ano, mes, "07").subscribe({
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
    });
    this.formGroup.controls["mes"].setValue(this.mes);
    this.formGroup.controls["ano"].setValue(this.actualYear);
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
  anular(element: any): void {
    console.log(element);
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
}
