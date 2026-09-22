import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

interface IDocumentoMonitor {
  ruta: string;
  handheld: string;
  agente: string;
  tipoDocumento: string;
  consecutivo: string;
  cliente: string;
  fecha: string;
  estado: "Pendiente" | "Sincronizado";
}

// Pantalla solo visual (manual pag. 135): no existe endpoint real.
const MOCK_DATA: IDocumentoMonitor[] = [
  {
    ruta: "R001",
    handheld: "HH01",
    agente: "AG01",
    tipoDocumento: "Factura",
    consecutivo: "FAC0045",
    cliente: "CL001",
    fecha: "2026-08-08T08:20:00",
    estado: "Sincronizado",
  },
  {
    ruta: "R002",
    handheld: "HH02",
    agente: "AG02",
    tipoDocumento: "Pedido",
    consecutivo: "PED0102",
    cliente: "CL003",
    fecha: "2026-08-09T09:30:00",
    estado: "Pendiente",
  },
  {
    ruta: "R001",
    handheld: "HH01",
    agente: "AG01",
    tipoDocumento: "Devolucion",
    consecutivo: "DEV0006",
    cliente: "CL002",
    fecha: "2026-08-09T10:05:00",
    estado: "Pendiente",
  },
];

@Component({
  selector: "app-monitoreo-documentos-page",
  templateUrl: "./monitoreo-documentos-page.component.html",
  styleUrls: ["./monitoreo-documentos-page.component.scss"],
})
export class MonitoreoDocumentosPageComponent implements OnInit, AfterViewInit {
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<IDocumentoMonitor>();
  displayedColumns: string[] = [
    "ruta",
    "handheld",
    "agente",
    "tipoDocumento",
    "consecutivo",
    "cliente",
    "fecha",
    "estado",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      fechaDesde: [""],
      fechaHasta: [""],
      ruta: [""],
      handheld: [""],
      agente: [""],
    });
    this.resultados.data = MOCK_DATA;
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
  }

  refrescar(): void {
    this.resultados.data = MOCK_DATA;
  }
}
