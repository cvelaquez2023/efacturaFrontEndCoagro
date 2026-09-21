import { AbstractControl } from "@angular/forms";
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable prefer-const */
import { FormBuilder, FormGroup } from "@angular/forms";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ClienteDteApiService } from "@app/modules/dtes/cliente/service/cliente-dte-api.service";
import { SnotifyService } from "ng-snotify";
import { MatTableDataSource } from "@angular/material/table";
import { IResponseDteInvalidaciones } from "@app/modules/ci/articulo/model/articulo-api-model-interface";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { CrearInvalidacionPageComponent } from "../crear-invalidacion-page/crear-invalidacion-page.component";
import { ListaObservacionesComponent } from "@app/modules/dtes/cliente/pages/lista-observaciones/lista-observaciones.component";

interface Opcion {
  value: string;
}
@Component({
  selector: "app-listar-invalidaciones-pages",
  templateUrl: "./listar-invalidaciones-pages.component.html",
  styleUrls: ["./listar-invalidaciones-pages.component.scss"],
})
export class ListarInvalidacionesPagesComponent implements OnInit {
  selectedCar!: string;
  selectedAno!: string;
  mes = new Date().getMonth() + 1;
  years: Opcion[] = [];
  now: Date = new Date();
  actualYear: number = this.now.getFullYear();
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
    private _formBuilder: FormBuilder
  ) {
    this.selectedCar = this.mes.toString();
    this.selectedAno = this.actualYear.toString();
  }
  listaDocumentos = new MatTableDataSource<IResponseDteInvalidaciones>();
  displayedColumns: string[] = [
    "fecha",
    "cliente",
    "nombre",
    "documento",
    "codigogeneracion",
    "fechaanulacion",
    "monto",
    "selloRecibido",
    "fechahorainva",
    "invalidado",

    "horas",
    "actions",
  ];
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this._loadFormGroup();

    this.getYears();
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
  getYears() {
    let year = new Date().getFullYear();
    let yearant = year - 5;
    for (let i = yearant; i <= year; i++) {
      this.years.push({ value: i.toString() });
    }
  }
  clickObservaciones(element: any): void {
    console.log("aqui estan ", element);
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
  private _loadDoc(ano: string, mes: string): void {
    this._dteApiService.getDteInvalidaciones(ano, mes).subscribe({
      next: (response) => {
        this.listaDocumentos.data = response.result;
      },
      error: (error) => {
        console.log("er", error);
      },
    });
  }
  ngAfterViewInit(): void {
    this.listaDocumentos.paginator = this.paginator;
    this.listaDocumentos.sort = this.sort;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaDocumentos.filter = filterValue.trim().toLowerCase();
  }
  clickDelete(): void {
    console.log("eliminamos");
  }
  clickCP(element: any): void {
    console.log("clickcp", element);
  }
  clickCB(element: any): void {
    console.log("clickcp", element);
  }
  clickCH(element: any): void {
    console.log("clickcp", element);
  }
  clickEdit(element: any): void {
    this._dialog
      .open(CrearInvalidacionPageComponent, {
        width: "40%",
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
