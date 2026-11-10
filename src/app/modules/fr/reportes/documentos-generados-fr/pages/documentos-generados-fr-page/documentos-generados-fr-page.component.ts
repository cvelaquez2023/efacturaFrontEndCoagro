import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { fmtFecha } from "../../../shared/reporte-utils";
import {
  abrirReporteRuteroPdf,
  fmtMonto,
  IRecuadroPdf,
} from "../../../shared/reporte-pdf-rutero";

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

  /** Reporte con el formato de Softland FR: resumen por tipo de documento y un recuadro por tipo. */
  generarReporte(): void {
    const f = this.filtroForm.value;
    const filas = this.resultados.filteredData;
    const tipos = Array.from(new Set(filas.map((d) => d.tipoDocumento)));
    const porTipo = tipos.map((tipo) => {
      const deTipo = filas.filter((d) => d.tipoDocumento === tipo);
      return {
        tipo,
        cantidad: deTipo.length,
        monto: deTipo.reduce((t, d) => t + d.monto, 0),
      };
    });
    const rango =
      f.fechaDesde || f.fechaHasta
        ? `${f.fechaDesde ? fmtFecha(f.fechaDesde + "T00:00") : "(inicio)"} al ${
            f.fechaHasta ? fmtFecha(f.fechaHasta + "T00:00") : "(fin)"
          }`
        : "todas";
    const detalle: IRecuadroPdf[][] = f.mostrarDetalles
      ? tipos.map((tipo) => [
          {
            titulo: tipo,
            columnas: [
              { header: "Consecutivo", valor: (d: IDocumentoGenerado) => d.consecutivo },
              { header: "Cliente", valor: (d: IDocumentoGenerado) => d.cliente, width: "*" },
              { header: "Fecha", valor: (d: IDocumentoGenerado) => fmtFecha(d.fecha + "T00:00") },
              { header: "Monto", valor: (d: IDocumentoGenerado) => fmtMonto(d.monto), alignment: "right", width: 80 },
            ],
            filas: filas.filter((d) => d.tipoDocumento === tipo),
            total: String(filas.filter((d) => d.tipoDocumento === tipo).length),
          },
        ])
      : [];
    abrirReporteRuteroPdf({
      titulo: "Reporte de Documentos Generados en FR",
      horizontal: false,
      paginas: [
        {
          encabezado: [
            `Compañía: ${f.compania || "(todas)"}`,
            `Fechas: ${rango}`,
            "Montos en moneda dólar.",
          ],
          bloques: [
            [
              {
                titulo: "Resumen por Tipo de Documento",
                cebra: true,
                columnas: [
                  { header: "Tipo Documento", valor: (r: typeof porTipo[number]) => r.tipo, width: "*" },
                  { header: "Cantidad", valor: (r: typeof porTipo[number]) => r.cantidad, alignment: "right" },
                  { header: "Monto", valor: (r: typeof porTipo[number]) => fmtMonto(r.monto), alignment: "right", width: 80 },
                ],
                filas: porTipo,
                total: String(filas.length),
                vacio: "Sin documentos para los filtros indicados.",
              },
            ],
            ...detalle,
          ],
        },
      ],
    });
  }
}
