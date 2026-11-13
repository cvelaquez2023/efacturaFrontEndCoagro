import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import { RutaApiService } from "../../../../rutas/rutas/service/ruta-api.service";
import { ClienteAsocRtApiService } from "../../../../administracion/clientes/service/cliente-asoc-rt-api.service";
import { NUMERO_DIA } from "../../../../rutas/asignacion-rutas/model/asignacion-ruta-model-interface";
import {
  mensajeError,
  ReportesFrApiService,
} from "../../../shared/reportes-fr-api.service";
import {
  claveDia,
  enRango,
  fmtFecha,
  hoyIso,
} from "../../../shared/reporte-utils";
import { abrirReportePdf, IColumnaPdf } from "../../../shared/reporte-pdf";
import {
  abrirReporteRuteroPdf,
  fmtMonto,
  fmtPorcentaje,
  IRecuadroPdf,
} from "../../../shared/reporte-pdf-rutero";

interface IClienteAbandono {
  ruta: string;
  rutaDescripcion: string;
  /** Vendedor (agente) asignado a la ruta en RUTA_ASIGNADA_RT, con su nombre. */
  vendedor: string;
  cliente: string;
  nombre: string;
  dias: string;
  ultimaVisita: string | null;
  /** null = nunca visitado (no hay visitas registradas). */
  diasSinVisita: number | null;
  /** Fecha del último pedido del cliente (alFAC_ENC_PED.FEC_PED); null si no tiene. */
  ultimoPedido: string | null;
  /** MON_CIV de ese último pedido; null si no tiene. */
  montoUltimoPedido: number | null;
}

interface IResumenRuta {
  ruta: string;
  descripcion: string;
  asignados: number;
  abandono: number;
  nuncaVisitados: number;
}

/** Periodo por defecto para considerar a un cliente en abandono (acordado: 3 meses). */
const PERIODO_DEFECTO = 3;
const UNIDAD_DEFECTO: "meses" | "dias" = "meses";

/** Visitas que se leen para hallar la última visita de cada cliente (las más recientes primero). */
const TOP_VISITAS = 20000;

/**
 * Clientes en Abandono (manual FRd pág. 77): clientes asignados a rutas (RUTA_CLIENTE) que no
 * tienen visitas registradas (VISITA) en el periodo indicado (por defecto los últimos 3 meses,
 * modificable en días o meses). Filtros: rango de clientes, rango de rutas y vendedor(es): al elegir
 * un vendedor se toman TODAS sus rutas (RUTA_ASIGNADA_RT.AGENTE). Sin compañía.
 */
@Component({
  selector: "app-clientes-abandono-page",
  templateUrl: "./clientes-abandono-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./clientes-abandono-page.component.scss",
  ],
})
export class ClientesAbandonoPageComponent implements OnInit, AfterViewInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _rutaApiService: RutaApiService,
    private _clienteAsocApi: ClienteAsocRtApiService,
    private _reportesApi: ReportesFrApiService
  ) {}

  filtroForm!: FormGroup;
  clientesF1: IF1Item[] = [];
  rutasF1: IF1Item[] = [];
  /** Vendedores (agentes) con sus rutas, para el filtro. */
  vendedores: { codigo: string; nombre: string; rutas: string[] }[] = [];
  /** Ruta → vendedor ("código · nombre"). */
  private _vendedorDeRuta = new Map<string, string>();
  /** Días equivalentes al periodo de la última consulta (para textos y reportes). */
  diasUmbral = 90;
  consultado = false;
  resultados = new MatTableDataSource<IClienteAbandono>();
  displayedColumns: string[] = [
    "ruta",
    "rutaDescripcion",
    "vendedor",
    "cliente",
    "nombre",
    "dias",
    "ultimaVisita",
    "diasSinVisita",
    "ultimoPedido",
    "montoUltimoPedido",
  ];
  readonly fmtFecha = fmtFecha;
  readonly fmtMonto = fmtMonto;
  readonly pedidosDisponibles = ReportesFrApiService.PEDIDOS_BACKEND_DISPONIBLE;
  /** Clientes asignados (ruta, cliente) que entraron en la evaluación, por ruta. */
  private _asignadosPorRuta = new Map<string, number>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      clienteDesde: [""],
      clienteHasta: [""],
      rutaDesde: [""],
      rutaHasta: [""],
      vendedores: [[] as string[]],
      dias: [PERIODO_DEFECTO, [Validators.required, Validators.min(0)]],
      unidad: [UNIDAD_DEFECTO],
    });
    forkJoin({
      clientes: this._clienteAsocApi.getClientesConNombre(),
      rutas: this._rutaApiService.getRutas(),
      asignadas: this._reportesApi.getRutasAsignadas().pipe(catchError(() => of([]))),
      agentes: this._reportesApi.getAgentes().pipe(catchError(() => of([]))),
    }).subscribe(({ clientes, rutas, asignadas, agentes }) => {
      // Vendedor de cada ruta y rutas de cada vendedor.
      const nombreAgente = new Map(agentes.map((a) => [a.codigo, a.nombre]));
      const rutasDe = new Map<string, string[]>();
      asignadas.forEach((r) => {
        const ruta = String(r.RUTA).trim();
        const agente = String(r.AGENTE ?? "").trim();
        if (!agente) return;
        rutasDe.set(agente, [...(rutasDe.get(agente) ?? []), ruta]);
        const nombre = nombreAgente.get(agente);
        this._vendedorDeRuta.set(ruta, nombre && nombre !== agente ? `${agente} · ${nombre}` : agente);
      });
      this.vendedores = Array.from(rutasDe.entries())
        .map(([codigo, rutasAgente]) => ({
          codigo,
          nombre: nombreAgente.get(codigo) || codigo,
          rutas: [...new Set(rutasAgente)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.clientesF1 = (clientes.result || []).map((c) => ({
        codigo: c.CODIGO,
        nombre: c.NOMBRE,
      }));
      this.rutasF1 = (rutas.result || []).map((r) => ({
        codigo: r.RUTA,
        nombre: r.DESCRIPCION,
      }));
    });
  }

  ngAfterViewInit(): void {
    this.resultados.paginator = this.paginator;
    this.resultados.sort = this.sort;
    // "Nunca visitado" se ordena como el más abandonado.
    this.resultados.sortingDataAccessor = (fila, columna) =>
      columna === "diasSinVisita"
        ? fila.diasSinVisita ?? Number.MAX_SAFE_INTEGER
        : columna === "montoUltimoPedido"
        ? fila.montoUltimoPedido ?? -1
        : String(fila[columna as keyof IClienteAbandono] ?? "");
  }

  imprimir(): void {
    if (this.filtroForm.invalid) {
      this.filtroForm.markAllAsTouched();
      this._snotifyService.warning(
        "El periodo de abandono es obligatorio y debe ser mayor o igual a cero",
        { position: SnotifyPosition.rightTop }
      );
      return;
    }
    const f = this.filtroForm.value;
    const hoy = hoyIso();
    const dias = this._diasDelPeriodo(Number(f.dias), f.unidad, hoy);
    this.diasUmbral = dias;
    // Rutas de los vendedores elegidos (vacío = todas).
    const rutasVendedor = new Set<string>(
      (f.vendedores as string[]).flatMap((v) => this.vendedores.find((x) => x.codigo === v)?.rutas ?? [])
    );
    forkJoin({
      asignaciones: this._reportesApi.getRutaClientes(),
      visitas: this._reportesApi.getVisitas({ hasta: hoy }, TOP_VISITAS),
      pedidos: this._reportesApi.getPedidos({ hasta: hoy }, TOP_VISITAS),
    }).subscribe({
      next: ({ asignaciones, visitas, pedidos }) => {
        // Último pedido por cliente (en cualquier ruta).
        const ultimoPedido = new Map<string, { fecha: string; monto: number | null }>();
        pedidos.forEach((p) => {
          const cliente = String(p.COD_CLT).trim();
          const fecha = p.HOR_INI ?? p.FEC_PED;
          const previo = ultimoPedido.get(cliente);
          if (!previo || fecha > previo.fecha) {
            ultimoPedido.set(cliente, {
              fecha,
              monto: p.MON_CIV == null ? null : Number(p.MON_CIV),
            });
          }
        });
        // Última visita por cliente (en cualquier ruta).
        const ultima = new Map<string, string>();
        const nombreVisita = new Map<string, string>();
        visitas.forEach((v) => {
          const cliente = String(v.CLIENTE).trim();
          const previa = ultima.get(cliente);
          if (!previa || v.INICIO > previa) ultima.set(cliente, v.INICIO);
          if (v.CLIENTE_NOMBRE) nombreVisita.set(cliente, v.CLIENTE_NOMBRE);
        });
        const nombreCliente = new Map(
          this.clientesF1.map((c) => [c.codigo, c.nombre])
        );
        const nombreRuta = new Map(this.rutasF1.map((r) => [r.codigo, r.nombre]));

        // Una fila por (ruta, cliente); un cliente puede tener varios días en la misma ruta.
        const porRutaCliente = new Map<string, IClienteAbandono & { dia: number[] }>();
        asignaciones
          .filter((a) => enRango(a.RUTA, f.rutaDesde, f.rutaHasta))
          .filter((a) => !rutasVendedor.size || rutasVendedor.has(String(a.RUTA).trim()))
          .filter((a) => enRango(a.CLIENTE, f.clienteDesde, f.clienteHasta))
          .forEach((a) => {
            const ruta = String(a.RUTA).trim();
            const cliente = String(a.CLIENTE).trim();
            const clave = `${ruta}|${cliente}`;
            const existente = porRutaCliente.get(clave);
            if (existente) {
              existente.dia.push(a.DIA);
              return;
            }
            const ultimaVisita = ultima.get(cliente) ?? null;
            porRutaCliente.set(clave, {
              ruta,
              rutaDescripcion: nombreRuta.get(ruta) ?? "",
              vendedor: this._vendedorDeRuta.get(ruta) ?? "",
              cliente,
              nombre:
                nombreCliente.get(cliente) || nombreVisita.get(cliente) || "",
              dias: "",
              dia: [a.DIA],
              ultimaVisita,
              diasSinVisita: ultimaVisita
                ? this._diasEntre(claveDia(ultimaVisita), hoy)
                : null,
              ultimoPedido: ultimoPedido.get(cliente)?.fecha ?? null,
              montoUltimoPedido: ultimoPedido.get(cliente)?.monto ?? null,
            });
          });

        this._asignadosPorRuta = new Map();
        porRutaCliente.forEach((c) =>
          this._asignadosPorRuta.set(
            c.ruta,
            (this._asignadosPorRuta.get(c.ruta) ?? 0) + 1
          )
        );

        this.resultados.data = Array.from(porRutaCliente.values())
          .filter((c) => c.diasSinVisita === null || c.diasSinVisita > dias)
          .map(({ dia, ...c }) => ({
            ...c,
            dias: dia
              .sort((a, b) => a - b)
              .map((d) => NUMERO_DIA[d] ?? String(d))
              .join(", "),
          }))
          .sort(
            (a, b) =>
              a.ruta.localeCompare(b.ruta, undefined, { numeric: true }) ||
              a.cliente.localeCompare(b.cliente, undefined, { numeric: true })
          );
        this.consultado = true;
        this.paginator?.firstPage();
      },
      error: (error: unknown) =>
        this._snotifyService.error(mensajeError(error), {
          position: SnotifyPosition.rightTop,
        }),
    });
  }

  /** Periodo → días: en meses se cuenta hacia atrás en el calendario (3 meses desde hoy). */
  private _diasDelPeriodo(cantidad: number, unidad: string, hoyIsoTexto: string): number {
    if (unidad !== "meses") return cantidad;
    const [y, m, d] = hoyIsoTexto.split("-").map(Number);
    const inicio = new Date(Date.UTC(y, m - 1 - cantidad, d));
    const iso = inicio.toISOString().slice(0, 10);
    return this._diasEntre(iso, hoyIsoTexto);
  }

  /** Texto del periodo elegido ("3 meses (92 días)" / "30 días"). */
  get textoPeriodo(): string {
    const f = this.filtroForm?.value;
    if (!f) return "";
    return f.unidad === "meses"
      ? `${f.dias} mes(es) (${this.diasUmbral} días)`
      : `${f.dias} día(s)`;
  }

  /** Nombres de los vendedores elegidos (para los reportes). */
  get textoVendedores(): string {
    const elegidos = (this.filtroForm?.value?.vendedores ?? []) as string[];
    if (!elegidos.length) return "todos";
    return elegidos.map((c) => this.vendedores.find((v) => v.codigo === c)?.nombre ?? c).join(", ");
  }

  private _diasEntre(desdeIso: string, hastaIso: string): number {
    const aFecha = (iso: string) => {
      const [y, m, d] = iso.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    };
    return Math.round((aFecha(hastaIso) - aFecha(desdeIso)) / 86400000);
  }

  cancelar(): void {
    this.filtroForm.reset({
      clienteDesde: "",
      clienteHasta: "",
      rutaDesde: "",
      rutaHasta: "",
      vendedores: [],
      dias: PERIODO_DEFECTO,
      unidad: UNIDAD_DEFECTO,
    });
    this.resultados.data = [];
    this._asignadosPorRuta = new Map();
    this.consultado = false;
  }

  textoDiasSinVisita(fila: IClienteAbandono): string {
    return fila.diasSinVisita === null ? "Nunca visitado" : String(fila.diasSinVisita);
  }

  /** Reporte con el formato de Softland FR: Resumen general y por ruta, y luego un recuadro por
   *  ruta con sus clientes en abandono (día de visita, última visita, días sin visita y último
   *  pedido; vacío si el cliente nunca hizo pedido). */
  generarReporte(): void {
    const f = this.filtroForm.value;
    const filas = this.resultados.filteredData;
    const rango = (d: string, h: string) =>
      d || h ? `desde ${d || "(inicio)"} hasta ${h || "(fin)"}` : "todas";
    const pct = (parte: number, total: number) =>
      total ? (parte / total) * 100 : 0;

    const rutas = Array.from(this._asignadosPorRuta.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const porRuta: IResumenRuta[] = rutas.map((ruta) => {
      const deRuta = filas.filter((c) => c.ruta === ruta);
      return {
        ruta,
        descripcion: this.rutasF1.find((r) => r.codigo === ruta)?.nombre ?? "",
        asignados: this._asignadosPorRuta.get(ruta) ?? 0,
        abandono: deRuta.length,
        nuncaVisitados: deRuta.filter((c) => c.diasSinVisita === null).length,
      };
    });
    const asignados = porRuta.reduce((t, r) => t + r.asignados, 0);
    const conDias = filas
      .map((c) => c.diasSinVisita)
      .filter((d): d is number => d !== null);
    const sinPedido = filas.filter((c) => !c.ultimoPedido).length;

    const resumen: [string, string][] = [
      ["Clientes Asignados Evaluados :", String(asignados)],
      ["Clientes en Abandono :", String(filas.length)],
      ["Clientes Nunca Visitados :", String(filas.filter((c) => c.diasSinVisita === null).length)],
      ["Porcentaje de Abandono :", fmtPorcentaje(pct(filas.length, asignados))],
      [
        "Promedio de Días sin Visita :",
        conDias.length ? fmtMonto(conDias.reduce((t, d) => t + d, 0) / conDias.length) : "",
      ],
      ["Máximo de Días sin Visita :", conDias.length ? String(Math.max(...conDias)) : ""],
      ["Clientes en Abandono sin Pedidos :", String(sinPedido)],
    ];

    const detallePorRuta = porRuta
      .filter((r) => r.abandono)
      .map(
        (r): IRecuadroPdf[] => [
          {
            titulo: `Ruta ${r.ruta}${r.descripcion ? " - " + r.descripcion : ""}`,
            columnas: [
              { header: "Ord.", valor: (c: IClienteAbandono & { ord: number }) => c.ord, alignment: "right" },
              { header: "Cliente", valor: (c: IClienteAbandono) => `(${c.cliente}) ${c.nombre}`, width: "*" },
              { header: "Día de Visita", valor: (c: IClienteAbandono) => c.dias },
              { header: "Última Visita", valor: (c: IClienteAbandono) => fmtFecha(c.ultimaVisita) || "Nunca" },
              { header: "Días sin Visita", valor: (c: IClienteAbandono) => this.textoDiasSinVisita(c), alignment: "right" },
              { header: "Último Pedido", valor: (c: IClienteAbandono) => fmtFecha(c.ultimoPedido) },
              { header: "Monto", valor: (c: IClienteAbandono) => fmtMonto(c.montoUltimoPedido), alignment: "right", width: 70 },
            ],
            filas: filas
              .filter((c) => c.ruta === r.ruta)
              .map((c, i) => ({ ...c, ord: i + 1 })),
            total: String(r.abandono),
          },
        ]
      );

    abrirReporteRuteroPdf({
      titulo: "Reporte de Clientes en Abandono",
      paginas: [
        {
          encabezado: [
            `Clientes sin visita en más de ${this.textoPeriodo}, al día ${fmtFecha(hoyIso() + "T00:00")}.`,
            `Vendedor(es): ${this.textoVendedores}.`,
            `Rutas: ${rango(f.rutaDesde, f.rutaHasta)}. Clientes: ${rango(f.clienteDesde, f.clienteHasta)}.`,
            "Montos en moneda dólar.",
            ...(this.pedidosDisponibles
              ? []
              : ["Pedidos (alFAC_ENC_PED): pendiente de endpoint en el backend."]),
          ],
          bloques: [
            [
              {
                titulo: "Resumen",
                cebra: true,
                columnas: [
                  { header: "Descripción", valor: (r: [string, string]) => r[0], width: "*" },
                  { header: "Valor", valor: (r: [string, string]) => r[1], alignment: "right", width: 70 },
                ],
                filas: resumen,
              },
              {
                titulo: "Resumen por Ruta",
                columnas: [
                  { header: "Ruta", valor: (r: IResumenRuta) => `${r.ruta} ${r.descripcion}`.trim(), width: "*" },
                  { header: "Asignados", valor: (r: IResumenRuta) => r.asignados, alignment: "right" },
                  { header: "En Abandono", valor: (r: IResumenRuta) => r.abandono, alignment: "right" },
                  { header: "Nunca Visit.", valor: (r: IResumenRuta) => r.nuncaVisitados, alignment: "right" },
                  { header: "%", valor: (r: IResumenRuta) => fmtPorcentaje(pct(r.abandono, r.asignados)), alignment: "right" },
                ],
                filas: porRuta,
                total: String(porRuta.length),
              },
            ],
            ...(detallePorRuta.length
              ? detallePorRuta
              : [
                  [
                    {
                      titulo: "Clientes en Abandono",
                      columnas: [{ header: "Cliente", valor: () => "", width: "*" }],
                      filas: [],
                      vacio: "No hay clientes en abandono para los filtros indicados.",
                    },
                  ],
                ]),
          ],
        },
      ],
    });
  }

  pdf(): void {
    const f = this.filtroForm.value;
    const rango = (d: string, h: string) =>
      `${d || "(inicio)"} a ${h || "(fin)"}`;
    const columnas: IColumnaPdf[] = [
      { header: "Ruta", valor: (c: IClienteAbandono) => c.ruta },
      { header: "Descripción", valor: (c: IClienteAbandono) => c.rutaDescripcion },
      { header: "Cliente", valor: (c: IClienteAbandono) => c.cliente },
      { header: "Nombre", valor: (c: IClienteAbandono) => c.nombre, width: "*" },
      { header: "Día Visita", valor: (c: IClienteAbandono) => c.dias },
      {
        header: "Última Visita",
        valor: (c: IClienteAbandono) => fmtFecha(c.ultimaVisita),
      },
      {
        header: "Días sin visita",
        valor: (c: IClienteAbandono) => this.textoDiasSinVisita(c),
        alignment: "right",
      },
    ];
    abrirReportePdf({
      titulo: "Reporte de Clientes en Abandono",
      filtros: [
        `Clientes: ${rango(f.clienteDesde, f.clienteHasta)}`,
        `Rutas: ${rango(f.rutaDesde, f.rutaHasta)}`,
        `Periodo en abandono: más de ${this.textoPeriodo} sin visita`,
        `Vendedor(es): ${this.textoVendedores}`,
      ],
      horizontal: true,
      secciones: [{ columnas, filas: this.resultados.filteredData }],
    });
  }
}
