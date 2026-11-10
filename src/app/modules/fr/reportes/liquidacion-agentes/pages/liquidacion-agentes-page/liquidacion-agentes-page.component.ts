import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { fmtFecha } from "../../../shared/reporte-utils";
import {
  abrirReporteRuteroPdf,
  fmtMonto,
} from "../../../shared/reporte-pdf-rutero";

interface ILiquidacionAgente {
  tipoDocumento: string;
  consecutivo: string;
  cliente: string;
  monto: number;
}

// Reporte solo visual (manual pag. 81): no existe endpoint real, se usan datos de muestra.
const MOCK_DATA: ILiquidacionAgente[] = [
  {
    tipoDocumento: "Factura Contado",
    consecutivo: "FAC0045",
    cliente: "CL001",
    monto: 145.5,
  },
  {
    tipoDocumento: "Recibo",
    consecutivo: "REC0021",
    cliente: "CL002",
    monto: 90.0,
  },
  {
    tipoDocumento: "Devolucion",
    consecutivo: "DEV0004",
    cliente: "CL001",
    monto: -25.0,
  },
];

@Component({
  selector: "app-liquidacion-agentes-page",
  templateUrl: "./liquidacion-agentes-page.component.html",
  styleUrls: ["./liquidacion-agentes-page.component.scss"],
})
export class LiquidacionAgentesPageComponent implements OnInit, AfterViewInit {
  constructor(private _formBuilder: FormBuilder) {}

  filtroForm!: FormGroup;
  resultados = new MatTableDataSource<ILiquidacionAgente>();
  displayedColumns: string[] = [
    "tipoDocumento",
    "consecutivo",
    "cliente",
    "monto",
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      compania: [""],
      agente: ["", [Validators.required]],
      ruta: ["", [Validators.required]],
      fechaDesde: ["", [Validators.required]],
      fechaHasta: ["", [Validators.required]],
    });
    this.resultados.data = MOCK_DATA;
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
  }

  get totalLiquidacion(): number {
    return this.resultados.data.reduce((sum, item) => sum + item.monto, 0);
  }

  generar(): void {
    this.resultados.data = MOCK_DATA;
  }

  /** Reporte con el formato de Softland FR: resumen por tipo de documento y el detalle de la
   *  liquidación con su total. */
  generarReporte(): void {
    const f = this.filtroForm.value;
    const filas = this.resultados.filteredData;
    const fecha = (iso: string) => (iso ? fmtFecha(iso + "T00:00") : "");
    const porTipo = Array.from(new Set(filas.map((l) => l.tipoDocumento))).map((tipo) => {
      const deTipo = filas.filter((l) => l.tipoDocumento === tipo);
      return {
        tipo,
        cantidad: deTipo.length,
        monto: deTipo.reduce((t, l) => t + l.monto, 0),
      };
    });
    abrirReporteRuteroPdf({
      titulo: "Reporte de Liquidación de Agentes",
      horizontal: false,
      paginas: [
        {
          encabezado: [
            `Agente: ${f.agente || "(todos)"}. Ruta: ${f.ruta || "(todas)"}.`,
            `Fechas: ${fecha(f.fechaDesde) || "(inicio)"} al ${fecha(f.fechaHasta) || "(fin)"}`,
            ...(f.compania ? [`Compañía: ${f.compania}`] : []),
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
                total: fmtMonto(this.totalLiquidacion),
              },
            ],
            [
              {
                titulo: "Detalle de Liquidación",
                columnas: [
                  { header: "Tipo Documento", valor: (l: ILiquidacionAgente) => l.tipoDocumento },
                  { header: "Consecutivo", valor: (l: ILiquidacionAgente) => l.consecutivo },
                  { header: "Cliente", valor: (l: ILiquidacionAgente) => l.cliente, width: "*" },
                  { header: "Monto", valor: (l: ILiquidacionAgente) => fmtMonto(l.monto), alignment: "right", width: 80 },
                ],
                filas,
                total: fmtMonto(this.totalLiquidacion),
                vacio: "Sin documentos para liquidar.",
              },
            ],
          ],
        },
      ],
    });
  }
}
