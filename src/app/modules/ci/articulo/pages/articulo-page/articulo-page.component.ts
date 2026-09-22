/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AddArticuloBodegaPageComponent } from "./../add-articulo-bodega-page/add-articulo-bodega-page.component";

import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { IResponseDtes } from "../../model/articulo-api-model-interface";
import { MatTableDataSource } from "@angular/material/table";
import { ArticuloApiService } from "./../../service/articulo-api.service";
import { SnotifyService, SnotifyPosition } from "ng-snotify";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { CargaArchivoPageComponent } from "../carga-archivo-page/carga-archivo-page.component";
import { EditarDtePageComponent } from "../editar-dte-page/editar-dte-page.component";
import { AplicarCbPageComponent } from "../aplicar-cb-page/aplicar-cb-page.component";
import { AplicarCpPageComponent } from "../aplicar-cp-page/aplicar-cp-page.component";
import { AplicarCb2PageComponent } from "../aplicar-cb2-page/aplicar-cb2-page.component";
import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";
import { ClienteDteApiService } from "@app/modules/dtes/cliente/service/cliente-dte-api.service";

interface Opcion {
  value: string;
}
@Component({
  selector: "app-articulo-page",
  templateUrl: "./articulo-page.component.html",
  styleUrls: ["./articulo-page.component.scss"],
})
export class ArticuloPageComponent implements OnInit, AfterViewInit {
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
    private _articuloApiService: ArticuloApiService,
    private _dteApiService: ClienteDteApiService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {
    this.selectedCar = this.mes.toString();
    this.selectedAno = this.actualYear.toString();
  }

  listArticulo = new MatTableDataSource<IResponseDtes>();
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
  searchKey!: "carlos";
  ngOnInit(): void {
    this._loadFormGroup();
    this.getYears();
  }

  ngAfterViewInit(): void {
    this.listArticulo.paginator = this.paginator;
    this.listArticulo.sort = this.sort;
  }
  getYears() {
    let year = new Date().getFullYear();
    let yearant = year - 5;
    for (let i = yearant; i <= year; i++) {
      this.years.push({ value: i.toString() });
    }
  }
  selectMes(mes: string): void {
    this._loadDoc(this.anoField.value as string, mes);
  }
  selectAno(ano: string): void {
    this._loadDoc(ano, this.mesField.value as string);
  }
  private _loadArticulo(): void {
    this._articuloApiService.getArticulo().subscribe({
      next: (response) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.listArticulo.data = response.result;
      },
      error: () => {
        console.log("erro");
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

  private _loadDoc(ano: string, mes: string): void {
    this._dteApiService.getProveedor(ano, mes, "03").subscribe({
      next: (response) => {
        this.listArticulo.data = response.result;
        console.log(response.result);
      },
      error: (error) => {
        console.log("er", error);
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listArticulo.filter = filterValue.trim().toLowerCase();
  }
  clickDelete(id: number): void {
    this._snotifyService.confirm("Esta seguro de eliminar el registro?", {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotifyService.remove(toast.id);
            this._articuloApiService
              .deleteArticulo(id)
              .subscribe((response) => {
                if (response && response.success) {
                  this._snotifyService.info("El registro ha sido Eliminado");
                  this._loadArticulo();
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
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  clickCP(element: any): void {
    this._dialog
      .open(AplicarCpPageComponent, {
        width: "60%",
        autoFocus: false,
        //maxHeight: '350vh',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "updateCP") {
          this._loadArticulo();
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  clickCB(element: any): void {
    this._dialog
      .open(AplicarCbPageComponent, {
        width: "50%",
        autoFocus: false,
        //maxHeight: '350vh',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "updateCH") {
          this._loadArticulo();
        }
      });
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  clickCH(element: any): void {
    this._dialog
      .open(AplicarCb2PageComponent, {
        width: "50%",
        autoFocus: false,
        //maxHeight: '350vh',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "updateCH") {
          this._loadArticulo();
        }
      });
  }

  openDialog(): void {
    this._dialog
      .open(CargaArchivoPageComponent, {
        //width: '80%'
        autoFocus: false,
        maxHeight: "90vh",
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "save") {
          this._loadArticulo();
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  clickEdit(element: any): void {
    this._dialog
      .open(EditarDtePageComponent, {
        width: "30%",
        autoFocus: false,
        //maxHeight: '350vh',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadArticulo();
        }
      });
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  clickStore(element: any): void {
    this._dialog
      .open(AddArticuloBodegaPageComponent, {
        //width: '30%',
        autoFocus: false,
        maxHeight: "90vh",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: element,
      })
      .afterClosed()
      .subscribe((val) => {
        if (val === "update") {
          this._loadArticulo();
        }
      });
  }
  get anoField(): AbstractControl {
    return this.formGroup.get("ano")!;
  }
  get mesField(): AbstractControl {
    return this.formGroup.get("mes")!;
  }
}
