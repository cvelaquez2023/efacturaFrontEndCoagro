import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { BitacoraSincronizacionApiService } from "../../service/bitacora-sincronizacion-api.service";
import {
  EstadoBitacora,
  IBitacoraSincronizacion,
} from "../../../shared/reportes-fr-model-interface";
import { mensajeError } from "../../../shared/reportes-fr-api.service";
import { fmtFecha, fmtHora, hoyIso, sumarDias } from "../../../shared/reporte-utils";
import { abrirReportePdf, IColumnaPdf } from "../../../shared/reporte-pdf";
import { abrirReporteRuteroPdf, IRecuadroPdf } from "../../../shared/reporte-pdf-rutero";

type FilaBitacora = IBitacoraSincronizacion;

/**
 * Bitácora de Sincronización (manual FRd pág. 76): lo que han subido las handhelds en un rango de
 * fechas, ordenado por ruta y hora. Fuente: erpadmin.VISITA (misma tabla que Histórico de Visitas).
 * Status: según alFAC_ENC_PED.DOC_PRO de los documentos de la visita ('S' = enviado al ERP,
 * null = pendiente); vacío si la visita no generó documento. Sin compañía.
 */
@Component({
  selector: "app-bitacora-sincronizacion-page",
  templateUrl: "./bitacora-sincronizacion-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./bitacora-sincronizacion-page.component.scss",
  ],
})
export class BitacoraSincronizacionPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _bitacoraApi: BitacoraSincronizacionApiService
  ) {}

  filtroForm!: FormGroup;
  consultado = false;
  consultando = false;
  resultados = new MatTableDataSource<FilaBitacora>();
  displayedColumns: string[] = [
    "ruta",
    "handheld",
    "agente",
    "cliente",
    "tipo",
    "proceso",
    "fecha",
    "horaInicio",
    "horaFin",
    "duracion",
    "estado",
  ];

  readonly fmtFecha = fmtFecha;
  readonly fmtHora = fmtHora;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      desde: [sumarDias(hoyIso(), -30), Validators.required],
      hasta: [hoyIso(), Validators.required],
    });
    // Se consulta de una vez para que la pantalla abra mostrando lo más reciente.
    this.imprimir();
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
    this.resultados.sortingDataAccessor = (fila, columna) => {
      switch (columna) {
        case "fecha":
        case "horaInicio":
          return fila.horaInicio ?? "";
        case "horaFin":
          return fila.horaFin ?? "";
        case "duracion":
          return fila.duracion ?? -1;
        default:
          return String(fila[columna as keyof FilaBitacora] ?? "");
      }
    };
    this.resultados.filterPredicate = (fila, filtro) =>
      [fila.ruta, fila.rutaNombre, fila.handheld, fila.agente, fila.agenteNombre,
        fila.cliente, fila.clienteNombre, fila.tipo, fila.proceso, fila.estado]
        .join(" ")
        .toLowerCase()
        .includes(filtro);
  }

  imprimir(): void {
    const { desde, hasta } = this.filtroForm.value;
    if (this.filtroForm.invalid || desde > hasta) {
      this._snotifyService.warning(
        "Indique un rango de fechas válido (Desde no puede ser mayor que Hasta)",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    this.consultando = true;
    this._bitacoraApi.getBitacora(desde, hasta).subscribe({
      next: (filas) => {
        this.resultados.data = filas.sort(
          (a, b) =>
            a.ruta.localeCompare(b.ruta, undefined, { numeric: true }) ||
            String(a.horaInicio).localeCompare(String(b.horaInicio))
        );
        this.consultado = true;
        this.consultando = false;
        this.paginator?.firstPage();
      },
      error: (error: unknown) => {
        this.consultando = false;
        this._snotifyService.error(mensajeError(error), {
          position: SnotifyPosition.rightTop,
        });
      },
    });
  }

  buscar(event: Event): void {
    this.resultados.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.paginator?.firstPage();
  }

  cancelar(): void {
    this.filtroForm.reset({ desde: sumarDias(hoyIso(), -30), hasta: hoyIso() });
    this.resultados.filter = "";
    this.imprimir();
  }

  get totalRutas(): number {
    return new Set(this.resultados.filteredData.map((f) => f.ruta)).size;
  }

  contarEstado(estado: EstadoBitacora): number {
    return this.resultados.filteredData.filter((f) => f.estado === estado).length;
  }

  claseEstado(estado: EstadoBitacora): string {
    return estado === "Enviado al ERP" ? "ok" : estado === "Pendiente de envío" ? "proceso" : "";
  }

  get totalHandhelds(): number {
    return new Set(this.resultados.filteredData.map((f) => f.handheld).filter(Boolean)).size;
  }

  private _rangoTexto(): string {
    const { desde, hasta } = this.filtroForm.value;
    return `Fechas de Auditoría: ${fmtFecha(desde + "T00:00")} al ${fmtFecha(hasta + "T00:00")}`;
  }

  private _columnasPdf(conRuta: boolean): IColumnaPdf[] {
    return [
      ...(conRuta ? [{ header: "Ruta", valor: (f: FilaBitacora) => f.ruta }] : []),
      { header: "HandHeld", valor: (f: FilaBitacora) => f.handheld },
      { header: "Agente", valor: (f: FilaBitacora) => f.agente },
      { header: "Cliente", valor: (f: FilaBitacora) => `(${f.cliente}) ${f.clienteNombre}`, width: "*" },
      { header: "Tipo", valor: (f: FilaBitacora) => f.tipo },
      { header: "Proceso", valor: (f: FilaBitacora) => f.proceso, width: 110 },
      { header: "Fecha", valor: (f: FilaBitacora) => fmtFecha(f.fecha) },
      { header: "Inicio", valor: (f: FilaBitacora) => fmtHora(f.horaInicio) },
      { header: "Fin", valor: (f: FilaBitacora) => fmtHora(f.horaFin) },
      { header: "Min.", valor: (f: FilaBitacora) => f.duracion, alignment: "center" },
      { header: "Status", valor: (f: FilaBitacora) => f.estado, width: 70 },
    ];
  }

  /** Reporte: resumen general y por ruta, y un recuadro por ruta con sus sincronizaciones. */
  generarReporte(): void {
    const filas = this.resultados.filteredData;
    const rutas = Array.from(new Set(filas.map((s) => s.ruta))).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const deRuta = (ruta: string) => filas.filter((s) => s.ruta === ruta);
    const porRuta = rutas.map((ruta) => {
      const lista = deRuta(ruta);
      return {
        ruta: `${ruta} ${lista[0]?.rutaNombre ?? ""}`.trim(),
        handheld: lista[0]?.handheld ?? "",
        registros: lista.length,
        clientes: new Set(lista.map((s) => s.cliente)).size,
      };
    });
    const resumen: [string, string][] = [
      ["Registros sincronizados :", String(filas.length)],
      ["Rutas :", String(rutas.length)],
      ["HandHelds :", String(this.totalHandhelds)],
      ["Enviados al ERP :", String(this.contarEstado("Enviado al ERP"))],
      ["Pendientes de envío :", String(this.contarEstado("Pendiente de envío"))],
      ["Sin documento :", String(this.contarEstado(""))],
      ["Clientes :", String(new Set(filas.map((s) => s.cliente)).size)],
    ];
    type FilaRuta = typeof porRuta[number];
    const detalle = rutas.map((ruta): IRecuadroPdf[] => [
      {
        titulo: `Ruta ${ruta}${deRuta(ruta)[0]?.rutaNombre ? " - " + deRuta(ruta)[0].rutaNombre : ""}`,
        columnas: this._columnasPdf(false),
        filas: deRuta(ruta),
        total: String(deRuta(ruta).length),
      },
    ]);
    abrirReporteRuteroPdf({
      titulo: "Reporte de Bitácora de Sincronización",
      paginas: [
        {
          encabezado: [
            this._rangoTexto(),
            "Status: según alFAC_ENC_PED.DOC_PRO (S = enviado al ERP; vacío = pendiente).",
          ],
          bloques: [
            [
              {
                titulo: "Resumen",
                columnas: [
                  { header: "Descripción", valor: (r: [string, string]) => r[0], width: "*" },
                  { header: "Valor", valor: (r: [string, string]) => r[1], alignment: "right", width: 70 },
                ],
                filas: resumen,
              },
              {
                titulo: "Resumen por Ruta",
                columnas: [
                  { header: "Ruta", valor: (r: FilaRuta) => r.ruta, width: "*" },
                  { header: "HandHeld", valor: (r: FilaRuta) => r.handheld },
                  { header: "Registros", valor: (r: FilaRuta) => r.registros, alignment: "right" },
                  { header: "Clientes", valor: (r: FilaRuta) => r.clientes, alignment: "right" },
                ],
                filas: porRuta,
                total: String(porRuta.length),
              },
            ],
            ...(detalle.length
              ? detalle
              : [
                  [
                    {
                      titulo: "Sincronizaciones",
                      columnas: [{ header: "Ruta", valor: () => "", width: "*" }],
                      filas: [],
                      vacio: "Sin sincronizaciones para los filtros indicados.",
                    },
                  ],
                ]),
          ],
        },
      ],
    });
  }

  pdf(): void {
    abrirReportePdf({
      titulo: "Bitácora de Sincronización",
      filtros: [this._rangoTexto()],
      horizontal: true,
      secciones: [
        {
          columnas: this._columnasPdf(true),
          filas: this.resultados.filteredData,
          vacio: "Sin sincronizaciones en el rango de fechas indicado.",
        },
      ],
    });
  }
}
