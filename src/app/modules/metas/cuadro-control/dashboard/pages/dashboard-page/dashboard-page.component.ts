import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import * as Highcharts from "highcharts";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import { forkJoin, from, Observable, of } from "rxjs";
import { catchError, debounceTime, finalize, map, mergeMap, tap, toArray } from "rxjs/operators";
import { descargarBlob } from "../../../../metas-shared/escribir-xlsx";
import { crearXlsxRico, ICeldaRica, IHojaRica } from "../../../../metas-shared/escribir-xlsx-rico";
import { cfBarraAvance, E, ESTILOS_INFORME_XML } from "../../../../metas-shared/estilos-informe-xlsx";
import { MetasApiService, mensajeErrorHttp } from "../../../../metas-shared/metas-api.service";
import { aNumero, IMetaVenta, IVentaDia, MESES, nombreMes } from "../../../../metas-shared/metas.model";
import { IOpcionBuscable } from "../../../../metas-shared/select-buscable/select-buscable.component";
import { COLORES, graficoAvance, graficoDona, graficoEvolucionAnio, graficoEvolucionMes } from "../../graficos";

NoDataToDisplay(Highcharts);
Highcharts.setOptions({
  lang: {
    noData: "Sin metas para los filtros elegidos",
    thousandsSep: ",",
    decimalPoint: ".",
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    shortMonths: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  },
});

type Periodo = "mes" | "anio";
export type EstadoMeta = "cumplida" | "progreso" | "rezagada" | "sinVenta";

/** Venta del ERP con el mes de la consulta (en consultas de un año llegan varios meses). */
interface IVentaMes extends IVentaDia {
  MES: number;
}

/** Una meta (vendedor × artículo × mes) con lo vendido y su estado. */
export interface IFilaMeta {
  mes: number;
  vendedor: string;
  nombreVendedor: string;
  lider: string;
  articulo: string;
  producto: string;
  proveedor: string;
  linea: string;
  meta: number;
  vendido: number;
  faltan: number;
  avance: number;
  estado: EstadoMeta;
  incentivo: number;
  ganado: number;
  aMeta: number;
}

/** Metas agrupadas (por vendedor, producto, proveedor, línea o líder). */
export interface IGrupoMeta {
  clave: string;
  nombre: string;
  /** Texto secundario: líder del vendedor, o proveedor · línea del producto. */
  detalle: string;
  metas: number;
  meta: number;
  vendido: number;
  faltan: number;
  avance: number;
  cumplidas: number;
  /** Vendedores distintos (en productos). */
  vendedores: number;
  ganado: number;
  aMeta: number;
  estado: EstadoMeta;
}

interface IKpi {
  titulo: string;
  valor: string;
  icono: string;
  detalle?: string;
  color: "marino" | "rojo" | "verde" | "turquesa" | "ambar" | "gris";
  /** Barra de progreso (fracción, 0..1+). */
  progreso?: number | null;
  /** Marca de lo esperado a la fecha (fracción) sobre la barra. */
  marca?: number | null;
}

const ABREV_MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const SIN_DATO = "(sin dato)";

export const TEXTO_ESTADO: Record<EstadoMeta, string> = {
  cumplida: "Cumplida",
  progreso: "En progreso",
  rezagada: "Rezagada",
  sinVenta: "Sin venta",
};

/** Cumplida ≥ 100 %, En progreso ≥ 50 %, Rezagada con venta por debajo del 50 %, Sin venta. */
const estadoDe = (vendido: number, meta: number): EstadoMeta => {
  if (meta > 0 && vendido >= meta) return "cumplida";
  if (vendido <= 0) return "sinVenta";
  return meta > 0 && vendido / meta >= 0.5 ? "progreso" : "rezagada";
};

/**
 * Cuadro de Control → Dashboard de Metas. Muestra únicamente el cumplimiento de las metas de venta
 * (unidades) del periodo: avance general, ritmo y proyección, metas cumplidas, avance por vendedor,
 * proveedor, línea y líder, y el detalle por producto. Lo vendido sale de las ventas del ERP para el
 * mismo vendedor + artículo + mes de cada meta (si el endpoint no está, de Venta_Unidades de la meta).
 * El periodo (mes o año) se consulta al backend; los demás filtros se aplican al instante.
 */
@Component({
  selector: "app-dashboard-page",
  templateUrl: "./dashboard-page.component.html",
  styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
  readonly Highcharts: typeof Highcharts = Highcharts;
  readonly meses = MESES;
  readonly textoEstado = TEXTO_ESTADO;
  readonly ventasEnVivo = MetasApiService.VENTAS_BACKEND_DISPONIBLE;
  readonly estados: (EstadoMeta | "todas")[] = ["todas", "cumplida", "progreso", "rezagada", "sinVenta"];

  filtros: FormGroup;
  opcionesVendedores: IOpcionBuscable[] = [];
  opcionesProveedores: IOpcionBuscable[] = [];
  opcionesLineas: IOpcionBuscable[] = [];
  opcionesLideres: IOpcionBuscable[] = [];

  cargando = false;
  progreso = "";
  cargado = false;

  kpis: IKpi[] = [];
  /** Avance general (fracción) para el encabezado de resultados. */
  avanceGeneral = 0;
  vendedores: IGrupoMeta[] = [];
  productos: IGrupoMeta[] = [];
  conteoEstados: Record<EstadoMeta, number> = { cumplida: 0, progreso: 0, rezagada: 0, sinVenta: 0 };
  /** Productos (metas agrupadas por artículo) en cada estado, para los chips de la tabla. */
  conteoProductos: Record<EstadoMeta, number> = { cumplida: 0, progreso: 0, rezagada: 0, sinVenta: 0 };
  filtroEstado: EstadoMeta | "todas" = "todas";
  verTodosProductos = false;
  hayIncentivo = false;

  // Gráficos
  gEvolucion: Highcharts.Options = {};
  gEstados: Highcharts.Options = {};
  gVendedores: Highcharts.Options = {};
  gProveedores: Highcharts.Options = {};
  gLineas: Highcharts.Options = {};
  gLideres: Highcharts.Options = {};

  private _metas: IMetaVenta[] = [];
  private _ventas: IVentaMes[] = [];
  private _filas: IFilaMeta[] = [];
  private _nombreVendedor = new Map<string, string>();
  private _consulta: { periodo: Periodo; anio: number; mes: number; meses: number[] } | null = null;

  constructor(fb: FormBuilder, private _api: MetasApiService, private _snotify: SnotifyService) {
    const hoy = new Date();
    this.filtros = fb.group({
      periodo: ["mes" as Periodo],
      anio: [hoy.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [hoy.getMonth() + 1],
      vendedor: [null],
      lider: [null],
      proveedor: [null],
      linea: [null],
      articulo: [""],
    });
  }

  ngOnInit(): void {
    for (const campo of ["vendedor", "lider", "proveedor", "linea"]) {
      this.filtros.get(campo)?.valueChanges.subscribe(() => this.recalcular());
    }
    this.filtros.get("articulo")?.valueChanges.pipe(debounceTime(350)).subscribe(() => this.recalcular());
    this._api.todosVendedores().subscribe({
      next: (lista) => {
        lista.forEach((v) => this._nombreVendedor.set(v.codigo, v.nombre));
        if (this.cargado) {
          this._armarFilas();
          this._opcionesFiltros();
          this.recalcular();
        }
      },
      error: () => undefined,
    });
    this.consultar();
  }

  get esAnual(): boolean {
    return this._consulta?.periodo === "anio";
  }

  get tituloPeriodo(): string {
    const c = this._consulta;
    if (!c) return "";
    return c.periodo === "anio" ? `Año ${c.anio}` : `${nombreMes(c.mes)} ${c.anio}`;
  }

  get hayFiltros(): boolean {
    const f = this.filtros.value;
    return !!(f.vendedor || f.lider || f.proveedor || f.linea || String(f.articulo ?? "").trim());
  }

  get productosFiltrados(): IGrupoMeta[] {
    return this.filtroEstado === "todas" ? this.productos : this.productos.filter((p) => p.estado === this.filtroEstado);
  }

  get productosVisibles(): IGrupoMeta[] {
    const lista = this.productosFiltrados;
    return this.verTodosProductos ? lista : lista.slice(0, 25);
  }

  get totalMetas(): number {
    return this.conteoEstados.cumplida + this.conteoEstados.progreso + this.conteoEstados.rezagada + this.conteoEstados.sinVenta;
  }

  // ------------------------------------------------------------------ carga

  /** Consulta al backend las metas del periodo y las ventas del ERP de esos meses. */
  consultar(): void {
    if (this.filtros.invalid || this.cargando) return;
    const f = this.filtros.value;
    const periodo: Periodo = f.periodo;
    const anio = Number(f.anio);
    const mes = Number(f.mes) || 1;
    const hoy = new Date();
    const hastaMes = anio < hoy.getFullYear() ? 12 : anio === hoy.getFullYear() ? hoy.getMonth() + 1 : 0;
    const meses = periodo === "anio" ? Array.from({ length: hastaMes }, (_, i) => i + 1) : [mes];
    if (!meses.length) {
      this._snotify.warning("Ese año todavía no ha comenzado", { position: SnotifyPosition.rightTop });
      return;
    }

    this.cargando = true;
    let listos = 0;
    this.progreso = this.ventasEnVivo ? `Consultando metas y ventas (0/${meses.length})…` : "Consultando metas…";
    const ventasMes = (m: number): Observable<IVentaMes[]> =>
      this._api.ventasDelMes(anio, m).pipe(map((lista) => lista.map((v) => ({ ...v, MES: m }))));

    forkJoin({
      metas: this._api.todasLasMetas({ anio, mes: periodo === "mes" ? mes : null }),
      ventas: from(meses).pipe(
        mergeMap((m) => ventasMes(m).pipe(tap(() => (this.progreso = `Consultando metas y ventas (${++listos}/${meses.length})…`))), 3),
        toArray(),
        map((partes) => partes.flat())
      ),
    })
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.progreso = "";
        })
      )
      .subscribe({
        next: (d) => {
          this._consulta = { periodo, anio, mes, meses };
          this._metas = d.metas.filter((m) => meses.includes(Number(m.Mes)));
          this._ventas = d.ventas;
          this._armarFilas();
          this._opcionesFiltros();
          this.filtroEstado = "todas";
          this.cargado = true;
          this.recalcular();
          if (!this._metas.length) {
            this._snotify.info(`No hay metas cargadas para ${this.tituloPeriodo.toLowerCase()}`, { position: SnotifyPosition.rightTop });
          }
        },
        error: (e) => this._snotify.error(mensajeErrorHttp(e), { position: SnotifyPosition.rightTop, timeout: 8000 }),
      });
  }

  /** Cruza cada meta con lo vendido por ese vendedor de ese artículo en ese mes. */
  private _armarFilas(): void {
    const vendidoPor = new Map<string, number>();
    this._ventas.forEach((v) => {
      const k = this._clave(v.VENDEDOR, v.ARTICULO, v.MES);
      vendidoPor.set(k, (vendidoPor.get(k) ?? 0) + (Number(v.UNIDADES) || 0));
    });
    this._filas = this._metas.map((m) => {
      const vendedor = String(m.Vendedor).trim();
      const articulo = String(m.Articulo).trim();
      const mes = Number(m.Mes);
      const meta = aNumero(m.Meta_Unidades) ?? 0;
      const vendido = this.ventasEnVivo ? vendidoPor.get(this._clave(vendedor, articulo, mes)) ?? 0 : aNumero(m.Venta_Unidades) ?? 0;
      const incentivo = aNumero(m.Incentivo) ?? 0;
      const minimo = aNumero(m.minimo) ?? meta;
      return {
        mes,
        vendedor,
        nombreVendedor: this._nombreVendedor.get(vendedor) || m.vendedor?.NOMBRE?.trim() || vendedor,
        lider: m.lider?.nombre?.trim() || SIN_DATO,
        articulo,
        producto: m.articulo?.DESCRIPCION?.trim() || articulo,
        proveedor: m.proveedor?.codigo?.trim() || m.proveedor?.nombre?.trim() || SIN_DATO,
        linea: m.lineaNegocio?.nombre?.trim() || SIN_DATO,
        meta,
        vendido,
        faltan: Math.max(meta - vendido, 0),
        avance: meta > 0 ? vendido / meta : 0,
        estado: estadoDe(vendido, meta),
        incentivo,
        ganado: vendido >= minimo ? vendido * incentivo : 0,
        aMeta: meta * incentivo,
      };
    });
    this.hayIncentivo = this._filas.some((f) => f.incentivo > 0);
  }

  private _clave(vendedor: string, articulo: string, mes: number): string {
    return `${String(vendedor).trim()}|${String(articulo).trim()}|${mes}`.toUpperCase();
  }

  private _opcionesFiltros(): void {
    const vend = new Map<string, string>();
    this._filas.forEach((f) => vend.set(f.vendedor, f.nombreVendedor));
    this.opcionesVendedores = [...vend.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([c, n]) => ({ valor: c, texto: `${c} · ${n}` }));
    const unicos = (lista: string[]) => [...new Set(lista)].filter(Boolean).sort((a, b) => a.localeCompare(b));
    const opciones = (lista: string[]) => unicos(lista).map((x) => ({ valor: x, texto: x }));
    this.opcionesProveedores = opciones(this._filas.map((f) => f.proveedor));
    this.opcionesLineas = opciones(this._filas.map((f) => f.linea));
    this.opcionesLideres = opciones(this._filas.map((f) => f.lider));
  }

  // ------------------------------------------------------------------ cálculo

  limpiarFiltros(): void {
    this.filtros.patchValue({ vendedor: null, lider: null, proveedor: null, linea: null, articulo: "" }, { emitEvent: false });
    this.recalcular();
  }

  /** Desde la tabla o el ranking: filtra el dashboard por ese vendedor (o lo quita si ya estaba). */
  verVendedor(codigo: string): void {
    const actual = this.filtros.value.vendedor;
    this.filtros.patchValue({ vendedor: actual === codigo ? null : codigo });
  }

  elegirEstado(e: EstadoMeta | "todas"): void {
    this.filtroEstado = e;
    this.verTodosProductos = false;
  }

  private _filasFiltradas(): IFilaMeta[] {
    const f = this.filtros.value;
    const texto = String(f.articulo ?? "").trim().toUpperCase();
    return this._filas.filter(
      (x) =>
        (!f.vendedor || x.vendedor === f.vendedor) &&
        (!f.lider || x.lider === f.lider) &&
        (!f.proveedor || x.proveedor === f.proveedor) &&
        (!f.linea || x.linea === f.linea) &&
        (!texto || x.articulo.toUpperCase().includes(texto) || x.producto.toUpperCase().includes(texto))
    );
  }

  /** Agrupa metas sumando meta, vendido y faltante (el faltante no se compensa entre metas). */
  private _agrupar(filas: IFilaMeta[], clave: (f: IFilaMeta) => string, nombre: (f: IFilaMeta) => string, detalle: (f: IFilaMeta) => string): IGrupoMeta[] {
    const grupos = new Map<string, IGrupoMeta & { _vend: Set<string> }>();
    filas.forEach((f) => {
      const k = clave(f);
      const g =
        grupos.get(k) ??
        ({
          clave: k,
          nombre: nombre(f),
          detalle: detalle(f),
          metas: 0,
          meta: 0,
          vendido: 0,
          faltan: 0,
          avance: 0,
          cumplidas: 0,
          vendedores: 0,
          ganado: 0,
          aMeta: 0,
          estado: "sinVenta",
          _vend: new Set<string>(),
        } as IGrupoMeta & { _vend: Set<string> });
      g.metas++;
      g.meta += f.meta;
      g.vendido += f.vendido;
      g.faltan += f.faltan;
      g.ganado += f.ganado;
      g.aMeta += f.aMeta;
      if (f.estado === "cumplida") g.cumplidas++;
      g._vend.add(f.vendedor);
      grupos.set(k, g);
    });
    return [...grupos.values()].map(({ _vend, ...g }) => ({
      ...g,
      vendedores: _vend.size,
      avance: g.meta > 0 ? g.vendido / g.meta : 0,
      estado: estadoDe(g.vendido, g.meta),
    }));
  }

  /** Aplica los filtros y rearma indicadores, gráficos y tablas. */
  recalcular(): void {
    if (!this._consulta) return;
    const c = this._consulta;
    const filas = this._filasFiltradas();
    const suma = (fn: (f: IFilaMeta) => number) => filas.reduce((t, f) => t + fn(f), 0);
    const fmtN = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    const fmt$ = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtP = (v: number) => `${(v * 100).toFixed(1)}%`;

    const meta = suma((f) => f.meta);
    const vendido = suma((f) => f.vendido);
    const faltan = suma((f) => f.faltan);
    const avance = meta > 0 ? vendido / meta : 0;
    this.avanceGeneral = avance;

    this.conteoEstados = { cumplida: 0, progreso: 0, rezagada: 0, sinVenta: 0 };
    filas.forEach((f) => this.conteoEstados[f.estado]++);

    // ---------- Grupos
    this.vendedores = this._agrupar(filas, (f) => f.vendedor, (f) => f.nombreVendedor, (f) => f.lider)
      .sort((a, b) => b.avance - a.avance || b.vendido - a.vendido);
    this.productos = this._agrupar(filas, (f) => f.articulo.toUpperCase(), (f) => f.producto, (f) => `${f.proveedor} · ${f.linea}`)
      .sort((a, b) => b.meta - a.meta || b.avance - a.avance);
    this.conteoProductos = { cumplida: 0, progreso: 0, rezagada: 0, sinVenta: 0 };
    this.productos.forEach((p) => this.conteoProductos[p.estado]++);
    const proveedores = this._agrupar(filas, (f) => f.proveedor, (f) => f.proveedor, () => "").sort((a, b) => b.avance - a.avance);
    const lineas = this._agrupar(filas, (f) => f.linea, (f) => f.linea, () => "").sort((a, b) => b.avance - a.avance);
    const lideres = this._agrupar(filas, (f) => f.lider, (f) => f.lider, () => "").sort((a, b) => b.avance - a.avance);
    const vendCumplen = this.vendedores.filter((v) => v.estado === "cumplida").length;

    // ---------- Ritmo del mes (solo un mes; el actual se proyecta al cierre)
    const hoy = new Date();
    let esperado: number | null = null;
    let proyeccion: number | null = null;
    if (c.periodo === "mes") {
      const diasMes = new Date(c.anio, c.mes, 0).getDate();
      const esActual = c.anio === hoy.getFullYear() && c.mes === hoy.getMonth() + 1;
      const pasado = c.anio < hoy.getFullYear() || (c.anio === hoy.getFullYear() && c.mes < hoy.getMonth() + 1);
      if (esActual) {
        esperado = hoy.getDate() / diasMes;
        proyeccion = meta > 0 ? (vendido / hoy.getDate()) * diasMes / meta : null;
      } else if (pasado) {
        esperado = 1;
      }
    }

    // ---------- Indicadores
    const colorAv = (a: number): IKpi["color"] => (a >= 1 ? "verde" : a >= 0.5 ? "ambar" : "rojo");
    const ganado = suma((f) => f.ganado);
    const aMeta = suma((f) => f.aMeta);
    this.kpis = [
      {
        titulo: "Cumplimiento de metas",
        valor: meta ? fmtP(avance) : "—",
        icono: "flag",
        color: meta ? colorAv(avance) : "gris",
        progreso: meta ? avance : null,
        marca: esperado !== null && esperado < 1 ? esperado : null,
        detalle: meta
          ? esperado !== null && esperado < 1
            ? `Esperado a hoy: ${fmtP(esperado)} (${avance >= esperado ? "en ritmo" : "por debajo del ritmo"})`
            : `${fmtN(vendido)} de ${fmtN(meta)} unidades`
          : "Sin metas cargadas en el periodo",
      },
      {
        titulo: "Unidades meta",
        valor: fmtN(meta),
        icono: "track_changes",
        color: "marino",
        detalle: `${fmtN(filas.length)} metas · ${fmtN(this.productos.length)} productos`,
      },
      {
        titulo: "Unidades vendidas",
        valor: fmtN(vendido),
        icono: "inventory_2",
        color: "turquesa",
        detalle: faltan ? `Faltan ${fmtN(faltan)} u para completar todas` : meta ? "Todas las metas completas" : "—",
      },
      {
        titulo: "Metas cumplidas",
        valor: `${fmtN(this.conteoEstados.cumplida)} / ${fmtN(filas.length)}`,
        icono: "task_alt",
        color: "verde",
        progreso: filas.length ? this.conteoEstados.cumplida / filas.length : null,
        detalle: filas.length ? `${fmtP(this.conteoEstados.cumplida / filas.length)} de las metas al 100 %` : "—",
      },
      {
        titulo: "Vendedores en meta",
        valor: `${fmtN(vendCumplen)} / ${fmtN(this.vendedores.length)}`,
        icono: "groups",
        color: "marino",
        progreso: this.vendedores.length ? vendCumplen / this.vendedores.length : null,
        detalle: "Con avance total ≥ 100 %",
      },
      proyeccion !== null
        ? {
            titulo: "Proyección al cierre",
            valor: fmtP(proyeccion),
            icono: "insights",
            color: colorAv(proyeccion),
            detalle: `Al ritmo actual: ${fmtN(proyeccion * meta)} de ${fmtN(meta)} u`,
          }
        : this.hayIncentivo
        ? {
            titulo: "Incentivo ganado",
            valor: fmt$(ganado),
            icono: "paid",
            color: "ambar",
            progreso: aMeta ? ganado / aMeta : null,
            detalle: `De ${fmt$(aMeta)} posibles al 100 %`,
          }
        : {
            titulo: "Metas sin venta",
            valor: fmtN(this.conteoEstados.sinVenta),
            icono: "report",
            color: this.conteoEstados.sinVenta ? "rojo" : "gris",
            detalle: "Productos con meta y 0 unidades",
          },
    ];

    // ---------- Evolución
    if (c.periodo === "anio") {
      const metaMes = c.meses.map((m) => filas.filter((f) => f.mes === m).reduce((t, f) => t + f.meta, 0));
      const vendMes = c.meses.map((m) => filas.filter((f) => f.mes === m).reduce((t, f) => t + f.vendido, 0));
      this.gEvolucion = graficoEvolucionAnio(c.meses.map((m) => ABREV_MES[m - 1]), metaMes, vendMes);
    } else {
      const dias = new Date(c.anio, c.mes, 0).getDate();
      const porDia = Array(dias).fill(0);
      const claves = new Set(filas.map((f) => this._clave(f.vendedor, f.articulo, f.mes)));
      this._ventas.forEach((v) => {
        if (!claves.has(this._clave(v.VENDEDOR, v.ARTICULO, v.MES))) return;
        const d = Math.min(Math.max(Number(v.DIA) || Number(String(v.FECHA).slice(8, 10)) || 1, 1), dias) - 1;
        porDia[d] += Number(v.UNIDADES) || 0;
      });
      const esActual = c.anio === hoy.getFullYear() && c.mes === hoy.getMonth() + 1;
      const corte = esActual ? hoy.getDate() : dias;
      let acc = 0;
      const acumulado = porDia.map((u, i) => (i < corte ? (acc += u) : null));
      this.gEvolucion = graficoEvolucionMes(
        Array.from({ length: dias }, (_, i) => String(i + 1)),
        this.ventasEnVivo ? acumulado : [],
        meta
      );
    }

    // ---------- Estados
    this.gEstados = graficoDona(
      [
        { nombre: TEXTO_ESTADO.cumplida, valor: this.conteoEstados.cumplida, color: COLORES.verde },
        { nombre: TEXTO_ESTADO.progreso, valor: this.conteoEstados.progreso, color: COLORES.ambar },
        { nombre: TEXTO_ESTADO.rezagada, valor: this.conteoEstados.rezagada, color: COLORES.rojo },
        { nombre: TEXTO_ESTADO.sinVenta, valor: this.conteoEstados.sinVenta, color: COLORES.gris },
      ],
      filas.length ? `<div style="text-align:center"><span style="font-size:26px;font-weight:700;color:${COLORES.marino}">${fmtN(filas.length)}</span><br/>metas</div>` : ""
    );

    // ---------- Avance por grupo
    const detalle = (g: IGrupoMeta) => `${fmtN(g.vendido)} de ${fmtN(g.meta)} u · ${g.cumplidas}/${g.metas} metas cumplidas`;
    const avanceDe = (lista: IGrupoMeta[]) =>
      graficoAvance(
        lista.map((g) => g.nombre),
        lista.map((g) => g.avance),
        lista.map(detalle)
      );
    this.gVendedores = avanceDe(this.vendedores);
    this.gProveedores = avanceDe(proveedores);
    this.gLineas = avanceDe(lineas);
    this.gLideres = avanceDe(lideres);
  }

  anchoBarra(avance: number | null | undefined): number {
    return Math.min(Math.max(Math.round((avance ?? 0) * 100), 0), 100);
  }

  // ------------------------------------------------------------------ Excel

  /** Excel con el formato de los informes de COAGRO: vendedores, productos y detalle de metas. */
  exportar(): void {
    if (!this._consulta) return;
    const titulo = `DASHBOARD DE METAS · ${this.tituloPeriodo.toUpperCase()}`;
    const filtros = `Filtros: ${this._textoFiltros()}`;
    const poner = (h: (ICeldaRica | null)[][], fila: number, col: number, celda: ICeldaRica) => ((h[fila - 1] ??= [])[col] = celda);
    const letra = (i: number) => String.fromCharCode(65 + i);

    const armar = (
      nombre: string,
      encabezados: string[],
      filas: ICeldaRica[][],
      anchos: number[],
      colAvance: number
    ): IHojaRica => {
      const h: (ICeldaRica | null)[][] = [];
      poner(h, 1, 0, { v: titulo, s: E.TITULO });
      poner(h, 2, 0, { v: `${nombre} · ${filtros}`, s: E.ETIQUETA_GRIS });
      encabezados.forEach((t, i) => poner(h, 4, i, { v: t, s: E.ENC }));
      filas.forEach((fila, i) => fila.forEach((celda, col) => poner(h, 5 + i, col, celda)));
      const n = filas.length;
      return {
        nombre,
        filas: h,
        anchos,
        altos: { 1: 23.25, 4: 30 },
        fijar: { columnas: 2, filas: 4 },
        autoFiltro: `A4:${letra(encabezados.length - 1)}${4 + Math.max(n, 1)}`,
        formatoCondicionalXml: n ? cfBarraAvance(`${letra(colAvance)}5:${letra(colAvance)}${4 + n}`) : "",
        sinCuadricula: true,
        ajustarPagina: true,
        filasTituloImpresion: "$4:$4",
      };
    };
    const alterna = (i: number) => (a: number, b: number) => (i % 2 === 1 ? b : a);

    const hojaVend = armar(
      "Vendedores",
      ["Código", "Vendedor", "Líder", "Metas", "Cumplidas", "Meta (u)", "Vendido (u)", "Faltan (u)", "Avance", ...(this.hayIncentivo ? ["Incentivo ganado ($)"] : [])],
      this.vendedores.map((v, i) => {
        const s = alterna(i);
        return [
          { v: v.clave, s: s(E.CODIGO, E.CODIGO_ALT) },
          { v: v.nombre, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: v.detalle, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: v.metas, s: s(E.ENTERO, E.ENTERO_ALT) },
          { v: v.cumplidas, s: s(E.ENTERO, E.ENTERO_ALT) },
          { v: v.meta, s: s(E.META, E.META_ALT) },
          { v: v.vendido, s: s(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT) },
          { v: v.faltan, s: s(E.FALTAN, E.FALTAN_ALT) },
          { v: v.avance, s: s(E.PCT, E.PCT_ALT) },
          ...(this.hayIncentivo ? [{ v: Number(v.ganado.toFixed(2)), s: s(E.MONEDA, E.MONEDA_ALT) }] : []),
        ];
      }),
      [10, 30, 18, 8, 10, 11, 11, 11, 10, 14],
      8
    );

    const hojaProd = armar(
      "Productos",
      ["Código", "Producto", "Proveedor · línea", "Vendedores", "Metas", "Cumplidas", "Meta (u)", "Vendido (u)", "Faltan (u)", "Avance"],
      this.productos.map((p, i) => {
        const s = alterna(i);
        return [
          { v: p.clave, s: s(E.CODIGO, E.CODIGO_ALT) },
          { v: p.nombre, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: p.detalle, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: p.vendedores, s: s(E.ENTERO, E.ENTERO_ALT) },
          { v: p.metas, s: s(E.ENTERO, E.ENTERO_ALT) },
          { v: p.cumplidas, s: s(E.ENTERO, E.ENTERO_ALT) },
          { v: p.meta, s: s(E.META, E.META_ALT) },
          { v: p.vendido, s: s(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT) },
          { v: p.faltan, s: s(E.FALTAN, E.FALTAN_ALT) },
          { v: p.avance, s: s(E.PCT, E.PCT_ALT) },
        ];
      }),
      [12, 38, 26, 11, 8, 10, 11, 11, 11, 10],
      9
    );

    const detalle = this._filasFiltradas().sort(
      (a, b) => a.mes - b.mes || a.nombreVendedor.localeCompare(b.nombreVendedor) || a.producto.localeCompare(b.producto)
    );
    const hojaDet = armar(
      "Detalle de metas",
      ["Código", "Producto", "Mes", "Vendedor", "Líder", "Proveedor", "Línea", "Meta (u)", "Vendido (u)", "Faltan (u)", "Avance", "Estado"],
      detalle.map((f, i) => {
        const s = alterna(i);
        return [
          { v: f.articulo, s: s(E.CODIGO, E.CODIGO_ALT) },
          { v: f.producto, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: nombreMes(f.mes), s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: `${f.vendedor} · ${f.nombreVendedor}`, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: f.lider, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: f.proveedor, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: f.linea, s: s(E.TEXTO, E.TEXTO_ALT) },
          { v: f.meta, s: s(E.META, E.META_ALT) },
          { v: f.vendido, s: s(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT) },
          { v: f.faltan, s: s(E.FALTAN, E.FALTAN_ALT) },
          { v: f.avance, s: s(E.PCT, E.PCT_ALT) },
          { v: TEXTO_ESTADO[f.estado], s: s(E.TEXTO, E.TEXTO_ALT) },
        ];
      }),
      [12, 36, 11, 30, 16, 12, 16, 10, 11, 10, 10, 13],
      10
    );

    const blob = crearXlsxRico([hojaVend, hojaProd, hojaDet], ESTILOS_INFORME_XML);
    const c = this._consulta;
    descargarBlob(blob, `Dashboard_Metas_${c.anio}${c.periodo === "mes" ? "-" + String(c.mes).padStart(2, "0") : ""}.xlsx`);
  }

  private _textoFiltros(): string {
    const f = this.filtros.value;
    const partes = [
      f.vendedor ? `vendedor ${f.vendedor}` : "",
      f.lider ? `líder ${f.lider}` : "",
      f.proveedor ? `proveedor ${f.proveedor}` : "",
      f.linea ? `línea ${f.linea}` : "",
      f.articulo ? `artículo «${f.articulo}»` : "",
    ].filter(Boolean);
    return partes.length ? partes.join(", ") : "ninguno";
  }
}
