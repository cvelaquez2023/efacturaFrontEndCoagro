import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin } from "rxjs";
import { IF1Item } from "../../../../rutas/shared/f1-selector/f1-selector.component";
import { RutaApiService } from "../../../../rutas/rutas/service/ruta-api.service";
import { ClienteAsocRtApiService } from "../../../../administracion/clientes/service/cliente-asoc-rt-api.service";
import { NUMERO_DIA } from "../../../../rutas/asignacion-rutas/model/asignacion-ruta-model-interface";
import {
  mensajeError,
  ReportesFrApiService,
} from "../../../shared/reportes-fr-api.service";
import {
  IPedidoReporte,
  IReporteVisita,
  IResumenVisita,
} from "../../../shared/reportes-fr-model-interface";
import {
  claveDia,
  diaSemanaRuta,
  enRango,
  fmtFecha,
  fmtHora,
  hoyIso,
} from "../../../shared/reporte-utils";
import { abrirReportePdf, IColumnaPdf } from "../../../shared/reporte-pdf";
import {
  abrirReporteRuteroPdf,
  fmtMonto,
  fmtPorcentaje,
  IPaginaRuteroPdf,
} from "../../../shared/reporte-pdf-rutero";

interface IVisitaDia {
  ruta: string;
  agente: string;
  cliente: string;
  nombre: string;
  razon: string;
  documento: string;
  inicio: string;
  fin: string | null;
  duracion: number | null;
  /** Minutos entre el fin de la visita anterior (misma ruta) y el inicio de esta. */
  traslado: number | null;
  enRuta: boolean;
  /** Pedidos (alFAC_ENC_PED.NUM_PED) tomados en la visita; vacío si no hizo pedido. */
  pedidos: string[];
  /** Suma de MON_CIV de esos pedidos; null si no hizo pedido. */
  totalPedido: number | null;
}

/** Margen al comparar la hora del pedido (HOR_INI) con el inicio/fin de la visita. */
const MARGEN_PEDIDO_MS = 5 * 60000;

/** Reparte los pedidos entre las visitas: primero por la misma ruta+cliente con HOR_INI dentro de
 *  la visita (± MARGEN_PEDIDO_MS); los que no caen en ninguna se asignan a la primera visita de esa
 *  ruta+cliente del mismo día. Cada pedido cuenta en una sola visita. */
const asignarPedidos = (
  visitas: IReporteVisita[],
  pedidos: IPedidoReporte[]
): Map<IReporteVisita, IPedidoReporte[]> => {
  const resultado = new Map<IReporteVisita, IPedidoReporte[]>();
  const clave = (ruta: string, cliente: string) =>
    `${String(ruta).trim()}|${String(cliente).trim()}`;
  const porCliente = new Map<string, IReporteVisita[]>();
  visitas.forEach((v) => {
    const k = clave(v.RUTA, v.CLIENTE);
    porCliente.set(k, [...(porCliente.get(k) ?? []), v]);
  });
  pedidos.forEach((p) => {
    const candidatas = porCliente.get(clave(p.COD_ZON, p.COD_CLT)) ?? [];
    const hora = new Date(p.HOR_INI ?? p.FEC_PED).getTime();
    const visita =
      candidatas.find((v) => {
        const inicio = new Date(v.INICIO).getTime();
        const fin = new Date(v.FIN ?? v.INICIO).getTime();
        return (
          hora >= inicio - MARGEN_PEDIDO_MS &&
          hora <= Math.max(fin, inicio) + MARGEN_PEDIDO_MS
        );
      }) ??
      candidatas
        .filter((v) => claveDia(v.INICIO) === claveDia(p.HOR_INI ?? p.FEC_PED))
        .sort((a, b) => a.INICIO.localeCompare(b.INICIO))[0];
    if (visita) resultado.set(visita, [...(resultado.get(visita) ?? []), p]);
  });
  return resultado;
};

/** Duración de la visita como h:mm:ss (o m:ss), calculada de INICIO/FIN. */
const fmtDuracion = (inicio: string, fin: string | null): string =>
  fin
    ? fmtSegundos((new Date(fin).getTime() - new Date(inicio).getTime()) / 1000)
    : "";

const fmtSegundos = (segundos: number | null): string => {
  if (segundos == null || segundos < 0) return "";
  const seg = Math.round(segundos);
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = String(seg % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
};

interface IClienteSinVisita {
  ruta: string;
  cliente: string;
  nombre: string;
  orden: number;
}

/**
 * Visitas por Día (manual FRd pág. 82): detalle de las visitas realizadas durante un día por el
 * agente asignado a cada ruta — tiempo entre inicio y fin de cada visita y entre el fin de una y
 * el inicio de la siguiente — más la lista de clientes sin visita, clientes visitados fuera de ruta
 * y clientes visitados a los que no se les generó una venta (documento). Sin compañía.
 *
 * Fuentes reales: /fr/reporteVisita (detalle), /fr/reporteVisita/resumen (totales por ruta),
 * /fr/rutaCliente (clientes planificados por día), /fr/rutaAsignadaRt (agente de la ruta).
 */
@Component({
  selector: "app-visitas-dia-page",
  templateUrl: "./visitas-dia-page.component.html",
  styleUrls: [
    "../../../shared/reporte-filtro.scss",
    "./visitas-dia-page.component.scss",
  ],
})
export class VisitasDiaPageComponent implements OnInit {
  constructor(
    private _formBuilder: FormBuilder,
    private _snotifyService: SnotifyService,
    private _rutaApiService: RutaApiService,
    private _clienteAsocApi: ClienteAsocRtApiService,
    private _reportesApi: ReportesFrApiService
  ) {}

  filtroForm!: FormGroup;
  rutasF1: IF1Item[] = [];
  consultado = false;
  diaSemana = "";

  resumen: IResumenVisita[] = [];
  visitas = new MatTableDataSource<IVisitaDia>();
  sinVisita = new MatTableDataSource<IClienteSinVisita>();
  fueraRuta = new MatTableDataSource<IVisitaDia>();
  sinVenta = new MatTableDataSource<IVisitaDia>();

  columnasVisitas = [
    "ruta",
    "agente",
    "cliente",
    "nombre",
    "razon",
    "documento",
    "inicio",
    "fin",
    "duracion",
    "traslado",
    "totalPedido",
    "enRuta",
  ];
  columnasSinVisita = ["ruta", "cliente", "nombre", "orden"];
  columnasVisitaSimple = ["ruta", "cliente", "nombre", "razon", "inicio", "fin"];

  readonly fmtHora = fmtHora;
  readonly fmtMonto = fmtMonto;
  readonly pedidosDisponibles = ReportesFrApiService.PEDIDOS_BACKEND_DISPONIBLE;
  private _nombreCliente = new Map<string, string>();
  private _nombreRuta = new Map<string, string>();
  private _agenteDeRuta = new Map<string, string>();
  /** Clientes planificados (RUTA_CLIENTE) para el día consultado. */
  private _planDelDia: { ruta: string; cliente: string }[] = [];

  ngOnInit(): void {
    this.filtroForm = this._formBuilder.group({
      rutaDesde: [""],
      rutaHasta: [""],
      fecha: [hoyIso(), Validators.required],
    });
    forkJoin({
      rutas: this._rutaApiService.getRutas(),
      clientes: this._clienteAsocApi.getClientesConNombre(),
    }).subscribe(({ rutas, clientes }) => {
      this.rutasF1 = (rutas.result || []).map((r) => ({
        codigo: r.RUTA,
        nombre: r.DESCRIPCION,
      }));
      this._nombreRuta = new Map(
        this.rutasF1.map((r) => [String(r.codigo).trim(), r.nombre])
      );
      this._nombreCliente = new Map(
        (clientes.result || []).map((c) => [c.CODIGO, c.NOMBRE])
      );
    });
  }

  imprimir(): void {
    if (this.filtroForm.invalid) {
      this._snotifyService.warning("La fecha es obligatoria", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    const f = this.filtroForm.value;
    const dia = diaSemanaRuta(f.fecha);
    const filtroFecha = { desde: f.fecha, hasta: f.fecha };
    forkJoin({
      visitas: this._reportesApi.getVisitas(filtroFecha),
      resumen: this._reportesApi.getResumenVisitas(filtroFecha),
      asignaciones: this._reportesApi.getRutaClientes(),
      rutasAsignadas: this._reportesApi.getRutasAsignadas(),
      pedidos: this._reportesApi.getPedidos(filtroFecha),
    }).subscribe({
      next: ({ visitas, resumen, asignaciones, rutasAsignadas, pedidos }) => {
        const pedidosDeVisita = asignarPedidos(visitas, pedidos);
        const pasaRuta = (ruta: string) =>
          enRango(ruta, f.rutaDesde, f.rutaHasta);
        const agenteDeRuta = new Map(
          rutasAsignadas.map((r) => [String(r.RUTA).trim(), String(r.AGENTE ?? "").trim()])
        );
        const planDelDia = asignaciones.filter(
          (a) => a.DIA === dia && pasaRuta(a.RUTA)
        );
        const planificado = new Set(
          planDelDia.map((a) => `${String(a.RUTA).trim()}|${String(a.CLIENTE).trim()}`)
        );

        // Detalle ordenado por ruta y hora de inicio, con el traslado desde la visita anterior.
        const detalle: IVisitaDia[] = visitas
          .filter((v) => pasaRuta(v.RUTA))
          .sort(
            (a, b) =>
              a.RUTA.localeCompare(b.RUTA, undefined, { numeric: true }) ||
              a.INICIO.localeCompare(b.INICIO)
          )
          .map((v) => {
            const ruta = String(v.RUTA).trim();
            const cliente = String(v.CLIENTE).trim();
            const susPedidos = pedidosDeVisita.get(v) ?? [];
            return {
              ruta,
              agente: agenteDeRuta.get(ruta) ?? "",
              cliente,
              nombre:
                v.CLIENTE_NOMBRE || this._nombreCliente.get(cliente) || "",
              razon: v.RAZON_DESCRIPCION ?? v.RAZON ?? "",
              documento: String(v.DOC_PRO ?? "").trim(),
              inicio: v.INICIO,
              fin: v.FIN,
              duracion: v.DURACION_MIN,
              traslado: null,
              enRuta: planificado.has(`${ruta}|${cliente}`),
              pedidos: susPedidos.map((p) => String(p.NUM_PED).trim()),
              totalPedido: susPedidos.length
                ? susPedidos.reduce((t, p) => t + Number(p.MON_CIV ?? 0), 0)
                : null,
            };
          });
        detalle.forEach((v, i) => {
          const anterior = detalle[i - 1];
          if (anterior && anterior.ruta === v.ruta && anterior.fin) {
            v.traslado = Math.round(
              (new Date(v.inicio).getTime() - new Date(anterior.fin).getTime()) /
                60000
            );
          }
        });

        const visitados = new Set(detalle.map((v) => `${v.ruta}|${v.cliente}`));
        this.visitas.data = detalle;
        this.fueraRuta.data = detalle.filter((v) => !v.enRuta);
        this.sinVenta.data = detalle.filter(
          (v) => !v.documento && !v.pedidos.length
        );
        this._agenteDeRuta = agenteDeRuta;
        this._planDelDia = planDelDia.map((a) => ({
          ruta: String(a.RUTA).trim(),
          cliente: String(a.CLIENTE).trim(),
        }));
        this.sinVisita.data = planDelDia
          .filter(
            (a) =>
              !visitados.has(`${String(a.RUTA).trim()}|${String(a.CLIENTE).trim()}`)
          )
          .map((a) => ({
            ruta: String(a.RUTA).trim(),
            cliente: String(a.CLIENTE).trim(),
            nombre: this._nombreCliente.get(String(a.CLIENTE).trim()) ?? "",
            orden: a.ORDEN,
          }))
          .sort(
            (a, b) =>
              a.ruta.localeCompare(b.ruta, undefined, { numeric: true }) ||
              a.orden - b.orden
          );
        this.resumen = resumen.filter((r) => pasaRuta(r.RUTA));
        this.diaSemana = NUMERO_DIA[dia];
        this.consultado = true;
      },
      error: (error: unknown) =>
        this._snotifyService.error(mensajeError(error), {
          position: SnotifyPosition.rightTop,
        }),
    });
  }

  cancelar(): void {
    this.filtroForm.reset({ rutaDesde: "", rutaHasta: "", fecha: hoyIso() });
    this.visitas.data = [];
    this.sinVisita.data = [];
    this.fueraRuta.data = [];
    this.sinVenta.data = [];
    this.resumen = [];
    this._planDelDia = [];
    this.consultado = false;
  }

  /** Reporte con el formato de Softland FR (una hoja por ruta): Resumen del Día, Visitas sin
   *  Ventas, Detalle de Visitas (fecha, hora, duración, cliente y total del pedido, vacío si no
   *  hizo pedido), Fuera de Ruta y Clientes sin Visita. */
  generarReporte(): void {
    const fecha: string = this.filtroForm.value.fecha;
    const cliente = (codigo: string, nombre: string) =>
      `(${codigo}) ${nombre}`.trim();
    const rutas = Array.from(
      new Set([
        ...this._planDelDia.map((p) => p.ruta),
        ...this.visitas.data.map((v) => v.ruta),
      ])
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (!rutas.length) {
      this._snotifyService.info("No hay datos para el día consultado", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }

    const paginas: IPaginaRuteroPdf[] = rutas.map((ruta) => {
      const visitas = this.visitas.data.filter((v) => v.ruta === ruta);
      const plan = new Set(
        this._planDelDia.filter((p) => p.ruta === ruta).map((p) => p.cliente)
      );
      const visitados = new Set(visitas.map((v) => v.cliente));
      const visitadosEnRuta = Array.from(visitados).filter((c) => plan.has(c));
      const fuera = visitas.filter((v) => !v.enRuta);
      const clientesFuera = Array.from(
        new Map(fuera.map((v) => [v.cliente, v])).values()
      );
      const sinVisita = this.sinVisita.data.filter((c) => c.ruta === ruta);
      const sinVenta = this.sinVenta.data.filter((v) => v.ruta === ruta);
      const conVenta = visitas.length - sinVenta.length;
      const cantPedidos = visitas.reduce((t, v) => t + v.pedidos.length, 0);
      const totalPedidos = visitas.reduce((t, v) => t + (v.totalPedido ?? 0), 0);
      const duraciones = visitas
        .filter((v) => v.fin)
        .map((v) => (new Date(v.fin!).getTime() - new Date(v.inicio).getTime()) / 1000)
        .filter((s) => s >= 0);
      const promedioSeg = duraciones.length
        ? duraciones.reduce((t, s) => t + s, 0) / duraciones.length
        : null;
      const pct = (parte: number, total: number) =>
        total ? (parte / total) * 100 : null;
      const descripcion = this._nombreRuta.get(ruta);
      const agente = this._agenteDeRuta.get(ruta);

      const resumen: [string, string][] = [
        ["Total de Clientes En Ruta :", String(plan.size)],
        ["Clientes Fuera de Ruta :", String(clientesFuera.length)],
        ["Clientes Visitados :", String(visitados.size)],
        ["Clientes No Visitados :", String(sinVisita.length)],
        ["Total de Visitas :", String(visitas.length)],
        ["Visitas a Clientes Con Ventas :", String(conVenta)],
        ["Visitas a Clientes Sin Ventas :", String(sinVenta.length)],
        ["Cantidad de Pedidos :", String(cantPedidos)],
        ["Total de Pedidos :", fmtMonto(totalPedidos)],
        ["Promedio por Pedido :", fmtMonto(cantPedidos ? totalPedidos / cantPedidos : 0)],
        ["Cobertura :", fmtPorcentaje(pct(visitadosEnRuta.length, plan.size) ?? 0)],
        ["Efectividad :", fmtPorcentaje(pct(conVenta, visitas.length) ?? 0)],
        ["Duración Promedio de Visita :", fmtSegundos(promedioSeg)],
        [
          "Jornada :",
          visitas.length
            ? `${fmtHora(visitas[0].inicio)} - ${fmtHora(visitas[visitas.length - 1].fin ?? visitas[visitas.length - 1].inicio)}`
            : "",
        ],
      ];

      return {
        encabezado: [
          `Fecha del día ${fmtFecha(fecha + "T00:00")} (${this.diaSemana}).`,
          `Para la ruta ${ruta}${descripcion ? " - " + descripcion : ""}.`,
          ...(agente ? [`Agente: ${agente}.`] : []),
          "Montos en moneda dólar.",
          ...(this.pedidosDisponibles
            ? []
            : ["Pedidos (alFAC_ENC_PED): pendiente de endpoint en el backend."]),
        ],
        bloques: [
          [
            {
              titulo: "Resumen del Día",
              cebra: true,
              columnas: [
                { header: "Descripción", valor: (r: [string, string]) => r[0], width: "*" },
                { header: "Monto", valor: (r: [string, string]) => r[1], alignment: "right", width: 70 },
              ],
              filas: resumen,
            },
            {
              titulo: "Visitas sin Ventas",
              columnas: [
                { header: "Cliente", valor: (v: IVisitaDia) => cliente(v.cliente, v.nombre), width: "*" },
                { header: "Hora", valor: (v: IVisitaDia) => fmtHora(v.inicio) },
                { header: "Razón", valor: (v: IVisitaDia) => v.razon || "No se generaron pedidos" },
              ],
              filas: sinVenta,
              total: String(sinVenta.length),
            },
          ],
          [
            {
              titulo: "Detalle de Visitas",
              columnas: [
                { header: "Fecha", valor: (v: IVisitaDia) => fmtFecha(v.inicio) },
                { header: "Hora Inicio", valor: (v: IVisitaDia) => fmtHora(v.inicio) },
                { header: "Hora Fin", valor: (v: IVisitaDia) => fmtHora(v.fin) },
                { header: "Duración", valor: (v: IVisitaDia) => fmtDuracion(v.inicio, v.fin), alignment: "right" },
                { header: "Cliente", valor: (v: IVisitaDia) => cliente(v.cliente, v.nombre), width: "*" },
                { header: "En Ruta", valor: (v: IVisitaDia) => (v.enRuta ? "Sí" : "No"), alignment: "center" },
                { header: "Pedido", valor: (v: IVisitaDia) => v.pedidos.join(", ") },
                { header: "Total Pedido", valor: (v: IVisitaDia) => fmtMonto(v.totalPedido), alignment: "right", width: 70 },
              ],
              filas: visitas,
              total: `${visitas.length} visita(s)     Total de pedidos: ${fmtMonto(totalPedidos)}`,
              vacio: "No hay visitas registradas ese día.",
            },
          ],
          [
            {
              titulo: "Fuera de Ruta",
              columnas: [
                { header: "Cliente", valor: (v: IVisitaDia) => cliente(v.cliente, v.nombre), width: "*" },
                { header: "Hora", valor: (v: IVisitaDia) => fmtHora(v.inicio) },
              ],
              filas: clientesFuera,
              total: String(clientesFuera.length),
            },
            {
              titulo: "Clientes sin Visita",
              columnas: [
                { header: "Ord.", valor: (c: IClienteSinVisita) => c.orden, alignment: "right" },
                { header: "Cliente", valor: (c: IClienteSinVisita) => cliente(c.cliente, c.nombre), width: "*" },
              ],
              filas: sinVisita,
              total: String(sinVisita.length),
            },
          ],
        ],
      };
    });

    abrirReporteRuteroPdf({ titulo: "Reporte de Visitas por Día", paginas });
  }

  pdf(): void {
    const f = this.filtroForm.value;
    const colVisita = (incluirTiempos: boolean): IColumnaPdf[] => [
      { header: "Ruta", valor: (v: IVisitaDia) => v.ruta },
      { header: "Cliente", valor: (v: IVisitaDia) => v.cliente },
      { header: "Nombre", valor: (v: IVisitaDia) => v.nombre, width: "*" },
      { header: "Razón", valor: (v: IVisitaDia) => v.razon },
      ...(incluirTiempos
        ? [{ header: "Documento", valor: (v: IVisitaDia) => v.documento }]
        : []),
      { header: "Inicio", valor: (v: IVisitaDia) => fmtHora(v.inicio) },
      { header: "Fin", valor: (v: IVisitaDia) => fmtHora(v.fin) },
      ...(incluirTiempos
        ? [
            {
              header: "Duración (min)",
              valor: (v: IVisitaDia) => v.duracion,
              alignment: "right" as const,
            },
            {
              header: "Traslado (min)",
              valor: (v: IVisitaDia) => v.traslado,
              alignment: "right" as const,
            },
            {
              header: "En ruta",
              valor: (v: IVisitaDia) => (v.enRuta ? "Sí" : "No"),
            },
          ]
        : []),
    ];
    abrirReportePdf({
      titulo: "Reporte de Visitas por Día",
      filtros: [
        `Fecha: ${fmtFecha(f.fecha + "T00:00")} (${this.diaSemana})`,
        `Rutas: ${f.rutaDesde || "(inicio)"} a ${f.rutaHasta || "(fin)"}`,
      ],
      horizontal: true,
      secciones: [
        {
          titulo: "Resumen por ruta",
          columnas: [
            { header: "Ruta", valor: (r: IResumenVisita) => r.RUTA },
            {
              header: "Descripción",
              valor: (r: IResumenVisita) => r.RUTA_DESCRIPCION,
              width: "*",
            },
            { header: "Visitas", valor: (r: IResumenVisita) => r.TOTAL_VISITAS, alignment: "right" },
            { header: "Clientes", valor: (r: IResumenVisita) => r.CLIENTES_VISITADOS, alignment: "right" },
            { header: "Con GPS", valor: (r: IResumenVisita) => r.VISITAS_CON_GPS, alignment: "right" },
            { header: "Prom. (min)", valor: (r: IResumenVisita) => r.DURACION_PROMEDIO_MIN, alignment: "right" },
            { header: "Total (min)", valor: (r: IResumenVisita) => r.DURACION_TOTAL_MIN, alignment: "right" },
            { header: "Primera", valor: (r: IResumenVisita) => fmtHora(r.PRIMERA_VISITA) },
            { header: "Última", valor: (r: IResumenVisita) => fmtHora(r.ULTIMA_VISITA) },
          ],
          filas: this.resumen,
        },
        { titulo: "Detalle de visitas", columnas: colVisita(true), filas: this.visitas.data },
        {
          titulo: "Clientes sin visita",
          columnas: [
            { header: "Ruta", valor: (c: IClienteSinVisita) => c.ruta },
            { header: "Cliente", valor: (c: IClienteSinVisita) => c.cliente },
            { header: "Nombre", valor: (c: IClienteSinVisita) => c.nombre, width: "*" },
            { header: "Orden", valor: (c: IClienteSinVisita) => c.orden, alignment: "right" },
          ],
          filas: this.sinVisita.data,
        },
        {
          titulo: "Clientes visitados fuera de ruta",
          columnas: colVisita(false),
          filas: this.fueraRuta.data,
        },
        {
          titulo: "Clientes visitados sin venta",
          columnas: colVisita(false),
          filas: this.sinVenta.data,
        },
      ],
    });
  }
}
