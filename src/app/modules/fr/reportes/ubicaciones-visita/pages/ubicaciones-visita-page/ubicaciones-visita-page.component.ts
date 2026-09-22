import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

interface IUbicacionVisita {
  cliente: string;
  ruta: string;
  fecha: string;
  distanciaM: number;
  dentroTolerancia: boolean;
}

// Reporte solo visual (manual pag. 84): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IUbicacionVisita[] = [
  {
    cliente: "CL001",
    ruta: "R001",
    fecha: "2026-08-08",
    distanciaM: 35,
    dentroTolerancia: true,
  },
  {
    cliente: "CL003",
    ruta: "R002",
    fecha: "2026-08-09",
    distanciaM: 210,
    dentroTolerancia: false,
  },
];

@Component({
  selector: "app-ubicaciones-visita-page",
  templateUrl: "./ubicaciones-visita-page.component.html",
  styleUrls: ["./ubicaciones-visita-page.component.scss"],
})
export class UbicacionesVisitaPageComponent implements OnInit, AfterViewInit {
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<IUbicacionVisita>();
  displayedColumns: string[] = [
    "cliente",
    "ruta",
    "fecha",
    "distanciaM",
    "dentroTolerancia",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      compania: ["COAGRO2"],
      fechaDesde: [""],
      fechaHasta: [""],
    });
    this.resultados.data = MOCK_DATA;
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
  }

  generar(): void {
    this.resultados.data = MOCK_DATA;
  }
}
