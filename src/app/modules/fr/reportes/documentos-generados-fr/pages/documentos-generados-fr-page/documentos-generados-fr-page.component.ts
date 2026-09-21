import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

interface IDocumentoGenerado {
  tipoDocumento: string;
  consecutivo: string;
  cliente: string;
  fecha: string;
  monto: number;
}

// Reporte solo visual (manual pag. 80): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IDocumentoGenerado[] = [
  {
    tipoDocumento: "Factura",
    consecutivo: "FAC0045",
    cliente: "CL001",
    fecha: "2026-08-08",
    monto: 145.5,
  },
  {
    tipoDocumento: "Pedido",
    consecutivo: "PED0102",
    cliente: "CL003",
    fecha: "2026-08-09",
    monto: 320.0,
  },
];

@Component({
  selector: "app-documentos-generados-fr-page",
  templateUrl: "./documentos-generados-fr-page.component.html",
  styleUrls: ["./documentos-generados-fr-page.component.scss"],
})
export class DocumentosGeneradosFrPageComponent
  implements OnInit, AfterViewInit
{
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<IDocumentoGenerado>();
  displayedColumns: string[] = [
    "tipoDocumento",
    "consecutivo",
    "cliente",
    "fecha",
    "monto",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      compania: ["COAGRO2"],
      fechaDesde: ["", [Validators.required]],
      fechaHasta: ["", [Validators.required]],
      mostrarDetalles: [false],
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
