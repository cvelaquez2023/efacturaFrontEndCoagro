import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { fmtFecha } from "../../../shared/reporte-utils";
import {
  abrirReporteRuteroPdf,
  IRecuadroPdf,
} from "../../../shared/reporte-pdf-rutero";

interface IDocumentoNoCargado {
  tipoDocumento: string;
  ruta: string;
  rutero: string;
  consecutivo: string;
  cliente: string;
  fechaDocumento: string;
  fechaSincronizacion: string;
}

// Reporte solo visual (manual pag. 75): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: IDocumentoNoCargado[] = [
  {
    tipoDocumento: "Factura",
    ruta: "R001",
    rutero: "AG01",
    consecutivo: "FAC0045",
    cliente: "CL001",
    fechaDocumento: "2026-08-08",
    fechaSincronizacion: "2026-08-08",
  },
  {
    tipoDocumento: "Pedido",
    ruta: "R002",
    rutero: "AG02",
    consecutivo: "PED0102",
    cliente: "CL003",
    fechaDocumento: "2026-08-09",
    fechaSincronizacion: "2026-08-09",
  },
  {
    tipoDocumento: "Devolucion",
    ruta: "R001",
    rutero: "AG01",
    consecutivo: "DEV0006",
    cliente: "CL002",
    fechaDocumento: "2026-08-09",
    fechaSincronizacion: "2026-08-10",
  },
];

@Component({
  selector: "app-documentos-no-cargados-page",
  templateUrl: "./documentos-no-cargados-page.component.html",
  styleUrls: ["./documentos-no-cargados-page.component.scss"],
})
export class DocumentosNoCargadosPageComponent
  implements OnInit, AfterViewInit
{
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<IDocumentoNoCargado>();
  displayedColumns: string[] = [
    "tipoDocumento",
    "ruta",
    "rutero",
    "consecutivo",
    "cliente",
    "fechaDocumento",
    "fechaSincronizacion",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({ compania: ["COAGRO2"] });
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
   *  documentos que no se cargaron al ERP. */
  generarReporte(): void {
    const f = this.filtroForm.value;
    const filas = this.resultados.filteredData;
    const rutas = Array.from(new Set(filas.map((d) => d.ruta))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const porRuta = rutas.map((ruta) => {
      const deRuta = filas.filter((d) => d.ruta === ruta);
      return {
        ruta,
        rutero: Array.from(new Set(deRuta.map((d) => d.rutero))).join(", "),
        cantidad: deRuta.length,
      };
    });
    const detalle = rutas.map(
      (ruta): IRecuadroPdf[] => [
        {
          titulo: `Ruta ${ruta}`,
          columnas: [
            { header: "Tipo Documento", valor: (d: IDocumentoNoCargado) => d.tipoDocumento },
            { header: "Rutero", valor: (d: IDocumentoNoCargado) => d.rutero },
            { header: "Consecutivo", valor: (d: IDocumentoNoCargado) => d.consecutivo },
            { header: "Cliente", valor: (d: IDocumentoNoCargado) => d.cliente, width: "*" },
            { header: "Fecha Documento", valor: (d: IDocumentoNoCargado) => fmtFecha(d.fechaDocumento + "T00:00") },
            { header: "Fecha Sincronización", valor: (d: IDocumentoNoCargado) => fmtFecha(d.fechaSincronizacion + "T00:00") },
          ],
          filas: filas.filter((d) => d.ruta === ruta),
          total: String(filas.filter((d) => d.ruta === ruta).length),
        },
      ]
    );
    abrirReporteRuteroPdf({
      titulo: "Reporte de Documentos No Cargados",
      paginas: [
        {
          encabezado: [`Compañía: ${f.compania || "(todas)"}`],
          bloques: [
            [
              {
                titulo: "Resumen por Ruta",
                cebra: true,
                columnas: [
                  { header: "Ruta", valor: (r: typeof porRuta[number]) => r.ruta },
                  { header: "Rutero", valor: (r: typeof porRuta[number]) => r.rutero, width: "*" },
                  { header: "Documentos", valor: (r: typeof porRuta[number]) => r.cantidad, alignment: "right" },
                ],
                filas: porRuta,
                total: String(filas.length),
                vacio: "No hay documentos pendientes de cargar.",
              },
            ],
            ...detalle,
          ],
        },
      ],
    });
  }
}
