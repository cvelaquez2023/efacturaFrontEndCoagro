import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import {
  abrirReporteRuteroPdf,
  fmtMonto,
  IRecuadroPdf,
} from "../../../shared/reporte-pdf-rutero";

interface IVentaConsignacion {
  cliente: string;
  ruta: string;
  articulo: string;
  cantidad: number;
  monto: number;
}

// Reporte solo visual (manual pag. 79): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IVentaConsignacion[] = [
  {
    cliente: "CL001",
    ruta: "R001",
    articulo: "ART001",
    cantidad: 10,
    monto: 145.5,
  },
  {
    cliente: "CL003",
    ruta: "R002",
    articulo: "ART002",
    cantidad: 4,
    monto: 58.0,
  },
];

@Component({
  selector: "app-ventas-consignacion-page",
  templateUrl: "./ventas-consignacion-page.component.html",
  styleUrls: ["./ventas-consignacion-page.component.scss"],
})
export class VentasConsignacionPageComponent implements OnInit, AfterViewInit {
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<IVentaConsignacion>();
  displayedColumns: string[] = [
    "cliente",
    "ruta",
    "articulo",
    "cantidad",
    "monto",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      compania: ["COAGRO2"],
      rutas: [""],
      clientes: [""],
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

  /** Reporte con el formato de Softland FR: resumen por ruta y un recuadro por ruta con los
   *  artículos vendidos en consignación por cliente. */
  generarReporte(): void {
    const f = this.filtroForm.value;
    const filas = this.resultados.filteredData;
    const rutas = Array.from(new Set(filas.map((v) => v.ruta))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const porRuta = rutas.map((ruta) => {
      const deRuta = filas.filter((v) => v.ruta === ruta);
      return {
        ruta,
        clientes: new Set(deRuta.map((v) => v.cliente)).size,
        cantidad: deRuta.reduce((t, v) => t + v.cantidad, 0),
        monto: deRuta.reduce((t, v) => t + v.monto, 0),
      };
    });
    const detalle = rutas.map(
      (ruta): IRecuadroPdf[] => [
        {
          titulo: `Ruta ${ruta}`,
          columnas: [
            { header: "Cliente", valor: (v: IVentaConsignacion) => v.cliente, width: "*" },
            { header: "Artículo", valor: (v: IVentaConsignacion) => v.articulo },
            { header: "Cantidad", valor: (v: IVentaConsignacion) => v.cantidad, alignment: "right" },
            { header: "Monto", valor: (v: IVentaConsignacion) => fmtMonto(v.monto), alignment: "right", width: 80 },
          ],
          filas: filas.filter((v) => v.ruta === ruta),
          total: fmtMonto(porRuta.find((r) => r.ruta === ruta)?.monto),
        },
      ]
    );
    abrirReporteRuteroPdf({
      titulo: "Reporte de Ventas en Consignación",
      horizontal: false,
      paginas: [
        {
          encabezado: [
            `Compañía: ${f.compania || "(todas)"}`,
            `Rutas: ${f.rutas || "(todas)"}. Clientes: ${f.clientes || "(todos)"}.`,
            "Montos en moneda dólar.",
          ],
          bloques: [
            [
              {
                titulo: "Resumen por Ruta",
                cebra: true,
                columnas: [
                  { header: "Ruta", valor: (r: typeof porRuta[number]) => r.ruta, width: "*" },
                  { header: "Clientes", valor: (r: typeof porRuta[number]) => r.clientes, alignment: "right" },
                  { header: "Cantidad", valor: (r: typeof porRuta[number]) => r.cantidad, alignment: "right" },
                  { header: "Monto", valor: (r: typeof porRuta[number]) => fmtMonto(r.monto), alignment: "right", width: 80 },
                ],
                filas: porRuta,
                total: fmtMonto(filas.reduce((t, v) => t + v.monto, 0)),
                vacio: "Sin ventas en consignación para los filtros indicados.",
              },
            ],
            ...detalle,
          ],
        },
      ],
    });
  }
}
