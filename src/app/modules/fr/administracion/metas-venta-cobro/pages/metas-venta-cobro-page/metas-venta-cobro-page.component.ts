import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

interface IMetaAgente {
  agente: string;
  ruta: string;
  mes: string;
  metaVenta: number;
  ventaActual: number;
  metaCobro: number;
  cobroActual: number;
}

// Pantalla solo visual: no existe endpoint real de Metas de Venta y Cobro. Datos de muestra
// solo con fines de maquetacion.
const MOCK_METAS: IMetaAgente[] = [
  {
    agente: "AG01",
    ruta: "R001",
    mes: "Agosto 2026",
    metaVenta: 12000,
    ventaActual: 8420,
    metaCobro: 9000,
    cobroActual: 6100,
  },
  {
    agente: "AG02",
    ruta: "R002",
    mes: "Agosto 2026",
    metaVenta: 9500,
    ventaActual: 5200,
    metaCobro: 7000,
    cobroActual: 4300,
  },
  {
    agente: "AG04",
    ruta: "R003",
    mes: "Agosto 2026",
    metaVenta: 7000,
    ventaActual: 6800,
    metaCobro: 5500,
    cobroActual: 5000,
  },
];

@Component({
  selector: "app-metas-venta-cobro-page",
  templateUrl: "./metas-venta-cobro-page.component.html",
  styleUrls: ["./metas-venta-cobro-page.component.scss"],
})
export class MetasVentaCobroPageComponent implements OnInit, AfterViewInit {
  listMetas = new MatTableDataSource<IMetaAgente>();
  displayedColumns: string[] = [
    "agente",
    "ruta",
    "mes",
    "metaVenta",
    "avanceVenta",
    "metaCobro",
    "avanceCobro",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.listMetas.data = MOCK_METAS;
  }

  ngAfterViewInit(): void {
    this.listMetas.paginator = this.paginator;
    this.listMetas.sort = this.sort;
  }

  porcentaje(actual: number, meta: number): number {
    return meta > 0 ? Math.min(100, Math.round((actual / meta) * 100)) : 0;
  }
}
