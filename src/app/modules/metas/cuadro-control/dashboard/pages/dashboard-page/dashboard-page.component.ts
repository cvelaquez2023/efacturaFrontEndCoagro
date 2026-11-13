import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import * as Highcharts from "highcharts";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import { forkJoin, from, Observable, of } from "rxjs";
import { catchError, debounceTime, finalize, map, mergeMap, tap, toArray } from "rxjs/operators";
import { ReportesFrApiService } from "@app/modules/fr/reportes/shared/reportes-fr-api.service";
import { asignarPedidos } from "@app/modules/fr/reportes/shared/reporte-utils";
import {
  IAgenteReporte,
  IPedidoReporte,
  IReporteVisita,
  IRutaAsignadaReporte,
} from "@app/modules/fr/reportes/shared/reportes-fr-model-interface";
import { descargarBlob } from "../../../../metas-shared/escribir-xlsx";
import { crearXlsxRico, ICeldaRica, IHojaRica } from "../../../../metas-shared/escribir-xlsx-rico";
import { cfBarraAvance, E, ESTILOS_INFORME_XML } from "../../../../metas-shared/estilos-informe-xlsx";
import { MetasApiService, mensajeErrorHttp } from "../../../../metas-shared/metas-api.service";
import { aNumero, IMetaVenta, IVentaDia, MESES, nombreMes } from "../../../../metas-shared/metas.model";
import { IOpcionBuscable } from "../../../../metas-shared/select-buscable/select-buscable.component";
import {
  COLORES,
  graficoApilado,
  graficoAvanceMetas,
  graficoDona,
  graficoRanking,
  graficoTendencia,
} from "../../graficos";

NoDataToDisplay(Highcharts);
Highcharts.setOptions({
  lang: {
    noData: "Sin datos para los filtros elegidos",
    thousandsSep: ",",
    decimalPoint: ".",
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    shortMonths: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
  },
});

type Periodo = "mes" | "anio";

/** Venta con el mes (en consultas de un año) y con proveedor/línea resueltos. */
interface IVentaDash extends IVentaDia {
  MES: number;
  proveedor: string;
  linea: string;
}

interface IKpi {
  titulo: string;
  valor: string;
  icono: string;
  detalle?: string;
  /** Variación contra el periodo anterior (fracción). */
  variacion?: number | null;
  color: "marino" | "rojo" | "verde" | "turquesa" | "ambar" | "gris";
  pendiente?: boolean;
}

export interface IFilaVendedor {
  codigo: string;
  nombre: string;
  ventas: number;
  unidades: number;
  costo: number | null;
  devoluciones: number;
  productos: number;
  clientesVisitados: number;
  meta: number;
  vendidoMeta: number;
  avance: number | null;
}

export interface IFilaProducto {
  codigo: string;
  descripcion: string;
  proveedor: string;
  unidades: number;
  ventas: number;
  costo: number | null;
  precioPromedio: number;
  vendedores: number;
}

const ABREV_MES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const SIN_DATO = "(sin meta)";

/**
 * Cuadro de Control → Dashboard. Vista general de la operación de rutas: ventas del ERP (por día,
 * vendedor, producto, proveedor y línea), avance contra las metas, visitas y pedidos de la app de
 * ruteo. El periodo (mes o año) se consulta al backend; los demás filtros (vendedor, proveedor, línea,
 * artículo) se aplican al instante sobre lo ya cargado.
 */
@Component({
  selector: "app-dashboard-page",
  templateUrl: "./dashboard-page.component.html",
  styleUrls: ["./dashboard-page.component.scss"],
})
export class DashboardPageComponent implements OnInit {
  readonly Highcharts: typeof Highcharts = Highcharts;
  readonly meses = MESES;

  filtros: FormGroup;
  opcionesVendedores: IOpcionBuscable[] = [];
  opcionesProveedores: IOpcionBuscable[] = [];
  opcionesLineas: IOpcionBuscable[] = [];

  cargando = false;
  progreso = "";
  cargado = false;
  /** El backend envía COSTO en ventasDiarias (margen y ganancia disponibles). */
  hayCosto = false;

  kpis: IKpi[] = [];
  vendedores: IFilaVendedor[] = [];
  productos: IFilaProducto[] = [];
  motivosNoVenta: { motivo: string; visitas: number }[] = [];
  verTodosProductos = false;

  // Gráficos
  gTendencia: Highcharts.Options = {};
  gVendedores: Highcharts.Options = {};
  gAvance: Highcharts.Options = {};
  gProveedores: Highcharts.Options = {};
  gLineas: Highcharts.Options = {};
  gProductos: Highcharts.Options = {};
  gVisitas: Highcharts.Options = {};
  gMotivos: Highcharts.Options = {};
  gMargen: Highcharts.Options = {};

  // Datos cargados del periodo
  private _ventas: IVentaDash[] = [];
  private _ventasAnteriores: IVentaDash[] = [];
  private _metas: IMetaVenta[] = [];
  private _visitas: IReporteVisita[] = [];
  private _pedidos: IPedidoReporte[] = [];
  private _vendedorDeRuta = new Map<string, string>();
  private _nombreVendedor = new Map<string, string>();
  private _consulta: { periodo: Periodo; anio: number; mes: number; meses: number[] } | null = null;

  constructor(
    fb: FormBuilder,
    private _api: MetasApiService,
    private _reportes: ReportesFrApiService,
    private _snotify: SnotifyService
  ) {
    const hoy = new Date();
    this.filtros = fb.group({
      periodo: ["mes" as Periodo],
      anio: [hoy.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [hoy.getMonth() + 1],
      vendedor: [null],
      proveedor: [null],
      linea: [null],
      articulo: [""],
    });
  }

  ngOnInit(): void {
    // Filtros que se aplican al instante sobre lo ya cargado (sin volver a consultar).
    for (const campo of ["vendedor", "proveedor", "linea"]) {
      this.filtros.get(campo)?.valueChanges.subscribe(() => this.recalcular());
    }
    this.filtros.get("articulo")?.valueChanges.pipe(debounceTime(350)).subscribe(() => this.recalcular());
    this._api.todosVendedores().subscribe({
      next: (lista) => lista.forEach((v) => this._nombreVendedor.set(v.codigo, v.nombre)),
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

  // ------------------------------------------------------------------ carga

  /** Consulta el periodo al backend (ventas, metas, visitas y pedidos). */
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
      this._snotify.warning("Ese año todavía no tiene ventas", { position: SnotifyPosition.rightTop });
      return;
    }
    const desde = `${anio}-${String(meses[0]).padStart(2, "0")}-01`;
    const ultimoMes = meses[meses.length - 1];
    const hasta = `${anio}-${String(ultimoMes).padStart(2, "0")}-${new Date(anio, ultimoMes, 0).getDate()}`;
    const anterior = periodo === "mes" ? (mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 }) : null;

    this.cargando = true;
    let listos = 0;
    this.progreso = `Consultando ventas del ERP (0/${meses.length})…`;
    const ventasMes = (a: number, m: number): Observable<IVentaDash[]> =>
      this._api.ventasDelMes(a, m).pipe(map((lista) => lista.map((v) => ({ ...v, MES: m, proveedor: "", linea: "" }))));

    forkJoin({
      ventas: from(meses).pipe(
        mergeMap((m) => ventasMes(anio, m).pipe(tap(() => (this.progreso = `Consultando ventas del ERP (${++listos}/${meses.length})…`))), 3),
        toArray(),
        map((partes) => partes.flat())
      ),
      anteriores: anterior ? ventasMes(anterior.anio, anterior.mes).pipe(catchError(() => of([] as IVentaDash[]))) : of([] as IVentaDash[]),
      metas: this._api.todasLasMetas({ anio, mes: periodo === "mes" ? mes : null }).pipe(catchError(() => of([] as IMetaVenta[]))),
      visitas: this._reportes.getVisitas({ desde, hasta }, 20000).pipe(catchError(() => of([] as IReporteVisita[]))),
      pedidos: this._reportes.getPedidos({ desde, hasta }, 20000).pipe(catchError(() => of([] as IPedidoReporte[]))),
      rutas: this._reportes.getRutasAsignadas().pipe(catchError(() => of([] as IRutaAsignadaReporte[]))),
      agentes: this._reportes.getAgentes().pipe(catchError(() => of([] as IAgenteReporte[]))),
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
          this._metas = d.metas;
          this._visitas = d.visitas;
          this._pedidos = d.pedidos;
          // Ruta → agente FR (RUTA_ASIGNADA_RT) → vendedor del ERP (AGENTE_ASOC_RT).
          const vendedorDeAgente = new Map(d.agentes.map((a) => [a.codigo, a.vendedor]));
          d.agentes.forEach((a) => a.nombre && this._nombreVendedor.set(a.vendedor, a.nombre));
          this._vendedorDeRuta = new Map(
            d.rutas.map((r) => {
              const agente = String(r.AGENTE ?? "").trim();
              return [String(r.RUTA).trim(), vendedorDeAgente.get(agente) ?? agente];
            })
          );
          this._ventas = this._resolverClasificacion(d.ventas);
          this._ventasAnteriores = this._resolverClasificacion(d.anteriores);
          this.hayCosto = this._ventas.some((v) => v.COSTO !== null && v.COSTO !== undefined);
          this._opcionesFiltros();
          this.cargado = true;
          this.recalcular();
        },
        error: (e) => this._snotify.error(mensajeErrorHttp(e), { position: SnotifyPosition.rightTop, timeout: 8000 }),
      });
  }

  /**
   * Proveedor y línea de cada venta. El backend ya los envía (de las metas si el artículo tiene meta;
   * si no, del ERP): con meta se muestra el código de metas (CALOX); del ERP, el nombre del proveedor.
   * Si no vienen, se toman de las metas del periodo.
   */
  private _resolverClasificacion(ventas: IVentaDash[]): IVentaDash[] {
    const deMeta = new Map<string, { proveedor: string; linea: string }>();
    this._metas.forEach((m) =>
      deMeta.set(String(m.Articulo).trim().toUpperCase(), {
        proveedor: m.proveedor?.codigo?.trim() || SIN_DATO,
        linea: m.lineaNegocio?.nombre?.trim() || SIN_DATO,
      })
    );
    return ventas.map((v) => {
      const meta = deMeta.get(v.ARTICULO.toUpperCase());
      const txt = (x: string | null | undefined) => (x ? String(x).trim() : "");
      const deErp = txt(v.ORIGEN_CLASIFICACION).toUpperCase() === "ERP";
      const proveedor = deErp
        ? txt(v.NOMBRE_PROVEEDOR) || txt(v.PROVEEDOR)
        : txt(v.PROVEEDOR) || txt(v.NOMBRE_PROVEEDOR);
      const linea = txt(v.NOMBRE_LINEA) || txt(v.LINEA_DESCRIPCION) || txt(v.LINEA);
      return {
        ...v,
        proveedor: proveedor || meta?.proveedor || SIN_DATO,
        linea: linea || meta?.linea || SIN_DATO,
      };
    });
  }

  private _opcionesFiltros(): void {
    const vend = new Map<string, string>();
    this._ventas.forEach((v) => vend.set(v.VENDEDOR, v.NOMBRE_VENDEDOR?.trim() || this._nombreVendedor.get(v.VENDEDOR) || v.VENDEDOR));
    this._metas.forEach((m) => {
      const c = String(m.Vendedor).trim();
      if (!vend.has(c)) vend.set(c, m.vendedor?.NOMBRE?.trim() || this._nombreVendedor.get(c) || c);
    });
    this.opcionesVendedores = [...vend.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([c, n]) => ({ valor: c, texto: `${c} · ${n}` }));
    const unicos = (lista: string[]) => [...new Set(lista)].filter(Boolean).sort((a, b) => a.localeCompare(b));
    this.opcionesProveedores = unicos(this._ventas.map((v) => v.proveedor)).map((p) => ({ valor: p, texto: p }));
    this.opcionesLineas = unicos(this._ventas.map((v) => v.linea)).map((l) => ({ valor: l, texto: l }));
  }

  // ------------------------------------------------------------------ cálculo

  limpiarFiltros(): void {
    this.filtros.patchValue({ vendedor: null, proveedor: null, linea: null, articulo: "" });
    this.recalcular();
  }

  private _filtrar(ventas: IVentaDash[]): IVentaDash[] {
    const f = this.filtros.value;
    const texto = String(f.articulo ?? "").trim().toUpperCase();
    return ventas.filter(
      (v) =>
        (!f.vendedor || v.VENDEDOR === f.vendedor) &&
        (!f.proveedor || v.proveedor === f.proveedor) &&
        (!f.linea || v.linea === f.linea) &&
        (!texto || v.ARTICULO.toUpperCase().includes(texto) || String(v.DESCRIPCION_ARTICULO ?? "").toUpperCase().includes(texto))
    );
  }

  private _metasFiltradas(): IMetaVenta[] {
    const f = this.filtros.value;
    const texto = String(f.articulo ?? "").trim().toUpperCase();
    return this._metas.filter((m) => {
      const prov = m.proveedor?.codigo?.trim() || SIN_DATO;
      const linea = m.lineaNegocio?.nombre?.trim() || SIN_DATO;
      return (
        (!f.vendedor || String(m.Vendedor).trim() === f.vendedor) &&
        (!f.proveedor || prov === f.proveedor) &&
        (!f.linea || linea === f.linea) &&
        (!texto ||
          String(m.Articulo).toUpperCase().includes(texto) ||
          String(m.articulo?.DESCRIPCION ?? "").toUpperCase().includes(texto))
      );
    });
  }

  /** Aplica los filtros a lo cargado y rearma indicadores, gráficos y tablas. */
  recalcular(): void {
    if (!this._consulta) return;
    const c = this._consulta;
    const ventas = this._filtrar(this._ventas);
    const anteriores = this._filtrar(this._ventasAnteriores);
    const metas = this._metasFiltradas();
    const suma = (lista: IVentaDash[], fn: (v: IVentaDash) => number) => lista.reduce((t, v) => t + fn(v), 0);

    const totalVentas = suma(ventas, (v) => v.VALOR);
    const totalUnidades = suma(ventas, (v) => v.UNIDADES);
    const totalCosto = this.hayCosto ? suma(ventas, (v) => Number(v.COSTO) || 0) : null;
    const devoluciones = suma(ventas.filter((v) => v.VALOR < 0), (v) => v.VALOR);
    const ventasAnt = suma(anteriores, (v) => v.VALOR);

    // Metas contra lo vendido de cada vendedor + artículo
    const vendidoPor = new Map<string, number>();
    ventas.forEach((v) => vendidoPor.set(`${v.VENDEDOR}|${v.ARTICULO}`.toUpperCase(), (vendidoPor.get(`${v.VENDEDOR}|${v.ARTICULO}`.toUpperCase()) ?? 0) + v.UNIDADES));
    let metaTotal = 0;
    let vendidoMetaTotal = 0;
    const metaPorVendedor = new Map<string, { meta: number; vendido: number }>();
    metas.forEach((m) => {
      const vend = String(m.Vendedor).trim();
      const meta = aNumero(m.Meta_Unidades) ?? 0;
      const vendido = vendidoPor.get(`${vend}|${String(m.Articulo).trim()}`.toUpperCase()) ?? 0;
      metaTotal += meta;
      vendidoMetaTotal += vendido;
      const acc = metaPorVendedor.get(vend) ?? { meta: 0, vendido: 0 };
      acc.meta += meta;
      acc.vendido += vendido;
      metaPorVendedor.set(vend, acc);
    });

    // Visitas (filtradas por vendedor según la ruta) y pedidos
    const fVend = this.filtros.value.vendedor as string | null;
    const visitas = this._visitas.filter((v) => !fVend || this._vendedorDeRuta.get(String(v.RUTA).trim()) === fVend);
    const pedidos = this._pedidos.filter((p) => !fVend || this._vendedorDeRuta.get(String(p.COD_ZON).trim()) === fVend);
    const pedidosPorVisita = asignarPedidos(visitas, pedidos);
    const conPedido = (v: IReporteVisita) => (pedidosPorVisita.get(v)?.length ?? 0) > 0 || !!v.DOC_PRO;
    const visitasConPedido = visitas.filter(conPedido).length;
    const efectividad = visitas.length ? visitasConPedido / visitas.length : null;
    const montoPedidos = pedidos.reduce((t, p) => t + (Number(p.MON_SIV) || 0), 0);

    // ---------- Indicadores
    const fmt$ = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtN = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    const vendedoresConVenta = new Set(ventas.filter((v) => v.VALOR > 0).map((v) => v.VENDEDOR)).size;
    const productosVendidos = new Set(ventas.filter((v) => v.UNIDADES > 0).map((v) => v.ARTICULO)).size;
    this.kpis = [
      {
        titulo: "Ventas netas",
        valor: fmt$(totalVentas),
        icono: "payments",
        color: "marino",
        variacion: c.periodo === "mes" && ventasAnt ? (totalVentas - ventasAnt) / Math.abs(ventasAnt) : null,
        detalle: c.periodo === "mes" ? `Mes anterior: ${fmt$(ventasAnt)}` : "Facturas menos devoluciones",
      },
      { titulo: "Unidades vendidas", valor: fmtN(totalUnidades), icono: "inventory_2", color: "turquesa", detalle: `${productosVendidos} productos distintos` },
      {
        titulo: "Precio promedio",
        valor: totalUnidades ? fmt$(totalVentas / totalUnidades) : "—",
        icono: "sell",
        color: "ambar",
        detalle: "Venta ÷ unidades",
      },
      totalCosto !== null
        ? {
            titulo: "Ganancia bruta",
            valor: fmt$(totalVentas - totalCosto),
            icono: "trending_up",
            color: "verde",
            detalle: `Margen ${totalVentas ? ((1 - totalCosto / totalVentas) * 100).toFixed(1) : "0"}% · costo ${fmt$(totalCosto)}`,
          }
        : {
            titulo: "Ganancia bruta",
            valor: "Pendiente",
            icono: "trending_up",
            color: "gris",
            pendiente: true,
            detalle: "Falta el costo en ventasDiarias (backend)",
          },
      {
        titulo: "Avance contra metas",
        valor: metaTotal ? `${((vendidoMetaTotal / metaTotal) * 100).toFixed(1)}%` : "—",
        icono: "flag",
        color: metaTotal && vendidoMetaTotal >= metaTotal ? "verde" : "rojo",
        detalle: metaTotal ? `${fmtN(vendidoMetaTotal)} de ${fmtN(metaTotal)} unidades meta` : "Sin metas cargadas en el periodo",
      },
      { titulo: "Vendedores con venta", valor: String(vendedoresConVenta), icono: "badge", color: "marino", detalle: `${metaPorVendedor.size} con metas` },
      {
        titulo: "Visitas de ruta",
        valor: fmtN(visitas.length),
        icono: "storefront",
        color: "turquesa",
        detalle: efectividad === null ? "Sin visitas registradas" : `Efectividad ${(efectividad * 100).toFixed(1)}% (${visitasConPedido} con pedido)`,
      },
      { titulo: "Devoluciones", valor: fmt$(Math.abs(devoluciones)), icono: "assignment_return", color: "rojo", detalle: `Pedidos de ruta: ${pedidos.length} · ${fmt$(montoPedidos)}` },
    ];

    // ---------- Tendencia
    if (c.periodo === "anio") {
      const porMes = c.meses.map((m) => ventas.filter((v) => v.MES === m));
      this.gTendencia = graficoTendencia(
        c.meses.map((m) => ABREV_MES[m - 1]),
        porMes.map((l) => Number(suma(l, (v) => v.VALOR).toFixed(2))),
        porMes.map((l) => suma(l, (v) => v.UNIDADES)),
        "Mes"
      );
    } else {
      const dias = new Date(c.anio, c.mes, 0).getDate();
      const vDia = Array(dias).fill(0);
      const uDia = Array(dias).fill(0);
      ventas.forEach((v) => {
        const d = Math.min(Math.max(Number(v.DIA), 1), dias) - 1;
        vDia[d] += v.VALOR;
        uDia[d] += v.UNIDADES;
      });
      this.gTendencia = graficoTendencia(
        Array.from({ length: dias }, (_, i) => String(i + 1)),
        vDia.map((x) => Number(x.toFixed(2))),
        uDia,
        "Día del mes"
      );
    }

    // ---------- Vendedores
    const porVend = new Map<string, IFilaVendedor & { _productos: Set<string> }>();
    ventas.forEach((v) => {
      const f =
        porVend.get(v.VENDEDOR) ??
        ({
          codigo: v.VENDEDOR,
          nombre: v.NOMBRE_VENDEDOR?.trim() || this._nombreVendedor.get(v.VENDEDOR) || v.VENDEDOR,
          ventas: 0,
          unidades: 0,
          costo: this.hayCosto ? 0 : null,
          devoluciones: 0,
          productos: 0,
          clientesVisitados: 0,
          meta: 0,
          vendidoMeta: 0,
          avance: null,
          _productos: new Set<string>(),
        } as IFilaVendedor & { _productos: Set<string> });
      f.ventas += v.VALOR;
      f.unidades += v.UNIDADES;
      if (f.costo !== null) f.costo += Number(v.COSTO) || 0;
      if (v.VALOR < 0) f.devoluciones += v.VALOR;
      if (v.UNIDADES > 0) f._productos.add(v.ARTICULO);
      porVend.set(v.VENDEDOR, f);
    });
    metaPorVendedor.forEach((m, cod) => {
      if (!porVend.has(cod)) {
        porVend.set(cod, {
          codigo: cod,
          nombre: this._nombreVendedor.get(cod) || cod,
          ventas: 0,
          unidades: 0,
          costo: this.hayCosto ? 0 : null,
          devoluciones: 0,
          productos: 0,
          clientesVisitados: 0,
          meta: 0,
          vendidoMeta: 0,
          avance: null,
          _productos: new Set<string>(),
        });
      }
    });
    const clientesPorVend = new Map<string, Set<string>>();
    visitas.forEach((v) => {
      const vend = this._vendedorDeRuta.get(String(v.RUTA).trim());
      if (!vend) return;
      const s = clientesPorVend.get(vend) ?? new Set<string>();
      s.add(String(v.CLIENTE).trim());
      clientesPorVend.set(vend, s);
    });
    this.vendedores = [...porVend.values()]
      .map(({ _productos, ...f }) => {
        const m = metaPorVendedor.get(f.codigo);
        return {
          ...f,
          productos: _productos.size,
          clientesVisitados: clientesPorVend.get(f.codigo)?.size ?? 0,
          meta: m?.meta ?? 0,
          vendidoMeta: m?.vendido ?? 0,
          avance: m && m.meta ? m.vendido / m.meta : null,
        };
      })
      .sort((a, b) => b.ventas - a.ventas);

    const topV = this.vendedores.filter((v) => v.ventas > 0).slice(0, 15);
    this.gVendedores = graficoRanking(
      topV.map((v) => v.nombre),
      topV.map((v) => Number(v.ventas.toFixed(2))),
      topV.map((v) => `${fmtN(v.unidades)} unidades · ${v.productos} productos`)
    );
    const conMeta = this.vendedores.filter((v) => v.avance !== null).sort((a, b) => (b.avance ?? 0) - (a.avance ?? 0));
    this.gAvance = graficoAvanceMetas(
      conMeta.map((v) => v.nombre),
      conMeta.map((v) => v.avance ?? 0),
      conMeta.map((v) => `${fmtN(v.vendidoMeta)} de ${fmtN(v.meta)} unidades`)
    );

    // ---------- Proveedores y líneas
    const agrupar = (clave: (v: IVentaDash) => string) => {
      const m = new Map<string, number>();
      ventas.forEach((v) => m.set(clave(v), (m.get(clave(v)) ?? 0) + v.VALOR));
      return [...m.entries()].map(([nombre, valor]) => ({ nombre, valor }));
    };
    this.gProveedores = graficoDona(agrupar((v) => v.proveedor));
    this.gLineas = graficoDona(agrupar((v) => v.linea), true, 6);

    // ---------- Productos
    const porProd = new Map<string, IFilaProducto & { _vend: Set<string> }>();
    ventas.forEach((v) => {
      const p =
        porProd.get(v.ARTICULO) ??
        ({
          codigo: v.ARTICULO,
          descripcion: v.DESCRIPCION_ARTICULO?.trim() || v.ARTICULO,
          proveedor: v.proveedor,
          unidades: 0,
          ventas: 0,
          costo: this.hayCosto ? 0 : null,
          precioPromedio: 0,
          vendedores: 0,
          _vend: new Set<string>(),
        } as IFilaProducto & { _vend: Set<string> });
      p.unidades += v.UNIDADES;
      p.ventas += v.VALOR;
      if (p.costo !== null) p.costo += Number(v.COSTO) || 0;
      p._vend.add(v.VENDEDOR);
      porProd.set(v.ARTICULO, p);
    });
    this.productos = [...porProd.values()]
      .map(({ _vend, ...p }) => ({ ...p, vendedores: _vend.size, precioPromedio: p.unidades ? p.ventas / p.unidades : 0 }))
      .sort((a, b) => b.ventas - a.ventas);
    const topP = this.productos.slice(0, 10);
    this.gProductos = graficoRanking(
      topP.map((p) => p.descripcion),
      topP.map((p) => Number(p.ventas.toFixed(2))),
      topP.map((p) => `${fmtN(p.unidades)} u · precio prom. ${fmt$(p.precioPromedio)}`),
      COLORES.turquesa
    );

    // ---------- Margen por vendedor (solo con costo)
    if (this.hayCosto) {
      const conCosto = this.vendedores.filter((v) => v.ventas > 0 && v.costo !== null).slice(0, 15);
      this.gMargen = graficoRanking(
        conCosto.map((v) => v.nombre),
        conCosto.map((v) => Number((v.ventas - (v.costo ?? 0)).toFixed(2))),
        conCosto.map((v) => `Margen ${v.ventas ? ((1 - (v.costo ?? 0) / v.ventas) * 100).toFixed(1) : "0"}%`),
        COLORES.verde
      );
    }

    // ---------- Visitas
    const claveDia = (iso: string) => (c.periodo === "anio" ? Number(iso.slice(5, 7)) : Number(iso.slice(8, 10)));
    const categorias =
      c.periodo === "anio"
        ? c.meses.map((m) => ABREV_MES[m - 1])
        : Array.from({ length: new Date(c.anio, c.mes, 0).getDate() }, (_, i) => String(i + 1));
    const con = Array(categorias.length).fill(0);
    const sin = Array(categorias.length).fill(0);
    visitas.forEach((v) => {
      const i = c.periodo === "anio" ? c.meses.indexOf(claveDia(v.INICIO)) : claveDia(v.INICIO) - 1;
      if (i < 0 || i >= categorias.length) return;
      if (conPedido(v)) con[i]++;
      else sin[i]++;
    });
    this.gVisitas = graficoApilado(
      categorias,
      [
        { nombre: "Con pedido", datos: con, color: COLORES.verde },
        { nombre: "Sin pedido", datos: sin, color: COLORES.rojo },
      ],
      c.periodo === "anio" ? "Mes" : "Día del mes"
    );
    const motivos = new Map<string, number>();
    visitas
      .filter((v) => !conPedido(v))
      .forEach((v) => {
        const m = v.RAZON_DESCRIPCION?.trim() || v.RAZON?.trim() || "Sin motivo registrado";
        motivos.set(m, (motivos.get(m) ?? 0) + 1);
      });
    this.motivosNoVenta = [...motivos.entries()].map(([motivo, n]) => ({ motivo, visitas: n })).sort((a, b) => b.visitas - a.visitas);
    this.gMotivos = graficoDona(
      this.motivosNoVenta.map((m) => ({ nombre: m.motivo, valor: m.visitas })),
      false,
      6
    );
  }

  get productosVisibles(): IFilaProducto[] {
    return this.verTodosProductos ? this.productos : this.productos.slice(0, 20);
  }

  margen(ventas: number, costo: number | null): number | null {
    return costo === null || !ventas ? null : 1 - costo / ventas;
  }

  anchoBarra(avance: number | null): number {
    return Math.min(Math.round((avance ?? 0) * 100), 100);
  }

  // ------------------------------------------------------------------ Excel

  /** Excel con el formato de los informes de COAGRO: hoja de vendedores y hoja de productos. */
  exportar(): void {
    if (!this._consulta) return;
    const titulo = `DASHBOARD DE RUTAS · ${this.tituloPeriodo.toUpperCase()}`;
    const hojaVend: (ICeldaRica | null)[][] = [];
    const hojaProd: (ICeldaRica | null)[][] = [];
    const poner = (h: (ICeldaRica | null)[][], fila: number, col: number, celda: ICeldaRica) => ((h[fila - 1] ??= [])[col] = celda);

    const encV = ["Código", "Vendedor", "Ventas ($)", "Unidades", "Precio prom.", "Productos", "Devoluciones ($)", "Clientes visitados", "Meta (u)", "Vendido en meta (u)", "Avance", ...(this.hayCosto ? ["Ganancia ($)", "Margen"] : [])];
    poner(hojaVend, 1, 0, { v: titulo, s: E.TITULO });
    poner(hojaVend, 2, 0, { v: `Vendedores · filtros: ${this._textoFiltros()}`, s: E.ETIQUETA_GRIS });
    encV.forEach((t, i) => poner(hojaVend, 4, i, { v: t, s: E.ENC }));
    this.vendedores.forEach((v, i) => {
      const r = 5 + i;
      const alt = i % 2 === 1;
      const s = (a: number, b: number) => (alt ? b : a);
      const fila: ICeldaRica[] = [
        { v: v.codigo, s: s(E.CODIGO, E.CODIGO_ALT) },
        { v: v.nombre, s: s(E.TEXTO, E.TEXTO_ALT) },
        { v: Number(v.ventas.toFixed(2)), s: s(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT) },
        { v: v.unidades, s: s(E.ENTERO, E.ENTERO_ALT) },
        { v: v.unidades ? Number((v.ventas / v.unidades).toFixed(2)) : null, s: s(E.MONEDA, E.MONEDA_ALT) },
        { v: v.productos, s: s(E.ENTERO, E.ENTERO_ALT) },
        { v: Number(Math.abs(v.devoluciones).toFixed(2)), s: s(E.MONEDA, E.MONEDA_ALT) },
        { v: v.clientesVisitados, s: s(E.ENTERO, E.ENTERO_ALT) },
        { v: v.meta || null, s: s(E.META, E.META_ALT) },
        { v: v.vendidoMeta || null, s: s(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT) },
        { v: v.avance ?? null, s: s(E.PCT, E.PCT_ALT) },
        ...(this.hayCosto
          ? [
              { v: Number((v.ventas - (v.costo ?? 0)).toFixed(2)), s: s(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT) },
              { v: this.margen(v.ventas, v.costo), s: s(E.PCT, E.PCT_ALT) },
            ]
          : []),
      ];
      fila.forEach((celda, col) => poner(hojaVend, r, col, celda));
    });

    const encP = ["Código", "Producto", "Proveedor", "Unidades", "Ventas ($)", "Precio prom.", "Vendedores", ...(this.hayCosto ? ["Ganancia ($)", "Margen"] : [])];
    poner(hojaProd, 1, 0, { v: titulo, s: E.TITULO });
    poner(hojaProd, 2, 0, { v: `Productos · filtros: ${this._textoFiltros()}`, s: E.ETIQUETA_GRIS });
    encP.forEach((t, i) => poner(hojaProd, 4, i, { v: t, s: E.ENC }));
    this.productos.forEach((p, i) => {
      const r = 5 + i;
      const alt = i % 2 === 1;
      const s = (a: number, b: number) => (alt ? b : a);
      const fila: ICeldaRica[] = [
        { v: p.codigo, s: s(E.CODIGO, E.CODIGO_ALT) },
        { v: p.descripcion, s: s(E.TEXTO, E.TEXTO_ALT) },
        { v: p.proveedor, s: s(E.TEXTO, E.TEXTO_ALT) },
        { v: p.unidades, s: s(E.ENTERO, E.ENTERO_ALT) },
        { v: Number(p.ventas.toFixed(2)), s: s(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT) },
        { v: Number(p.precioPromedio.toFixed(2)), s: s(E.MONEDA, E.MONEDA_ALT) },
        { v: p.vendedores, s: s(E.ENTERO, E.ENTERO_ALT) },
        ...(this.hayCosto
          ? [
              { v: Number((p.ventas - (p.costo ?? 0)).toFixed(2)), s: s(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT) },
              { v: this.margen(p.ventas, p.costo), s: s(E.PCT, E.PCT_ALT) },
            ]
          : []),
      ];
      fila.forEach((celda, col) => poner(hojaProd, r, col, celda));
    });

    const letra = (i: number) => String.fromCharCode(65 + i);
    const hoja = (nombre: string, filas: (ICeldaRica | null)[][], cols: number, n: number, anchos: number[], colAvance: number | null): IHojaRica => ({
      nombre,
      filas,
      anchos,
      altos: { 1: 23.25, 4: 30 },
      fijar: { columnas: 2, filas: 4 },
      autoFiltro: `A4:${letra(cols - 1)}${4 + Math.max(n, 1)}`,
      formatoCondicionalXml: colAvance !== null && n ? cfBarraAvance(`${letra(colAvance)}5:${letra(colAvance)}${4 + n}`) : "",
      sinCuadricula: true,
      ajustarPagina: true,
      filasTituloImpresion: "$4:$4",
    });
    const blob = crearXlsxRico(
      [
        hoja("Vendedores", hojaVend, encV.length, this.vendedores.length, [10, 30, 13, 10, 11, 10, 13, 11, 10, 12, 10, 13, 10], 10),
        hoja("Productos", hojaProd, encP.length, this.productos.length, [10, 38, 14, 10, 13, 11, 10, 13, 10], null),
      ],
      ESTILOS_INFORME_XML
    );
    const c = this._consulta;
    descargarBlob(blob, `Dashboard_Rutas_${c.anio}${c.periodo === "mes" ? "-" + String(c.mes).padStart(2, "0") : ""}.xlsx`);
  }

  private _textoFiltros(): string {
    const f = this.filtros.value;
    const partes = [
      f.vendedor ? `vendedor ${f.vendedor}` : "",
      f.proveedor ? `proveedor ${f.proveedor}` : "",
      f.linea ? `línea ${f.linea}` : "",
      f.articulo ? `artículo «${f.articulo}»` : "",
    ].filter(Boolean);
    return partes.length ? partes.join(", ") : "ninguno";
  }
}
