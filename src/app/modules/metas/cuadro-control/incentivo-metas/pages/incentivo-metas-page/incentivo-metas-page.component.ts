import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin } from "rxjs";
import { finalize } from "rxjs/operators";
import { descargarBlob } from "../../../../metas-shared/escribir-xlsx";
import { crearXlsxRico, ICeldaRica } from "../../../../metas-shared/escribir-xlsx-rico";
import { cfBarraAvance, E, ESTILOS_INFORME_XML } from "../../../../metas-shared/estilos-informe-xlsx";
import { crearInformeIncentivoXlsx } from "./informe-incentivo-xlsx";
import { MetasApiService, mensajeErrorHttp } from "../../../../metas-shared/metas-api.service";
import { aNumero, IMetaVenta, IVentaDia, MESES, nombreMes } from "../../../../metas-shared/metas.model";
import { IOpcionBuscable } from "../../../../metas-shared/select-buscable/select-buscable.component";

/** Semana del mes: lunes a sábado (los domingos cuentan con la semana anterior). */
export interface ISemana {
  numero: number;
  /** Día del mes en que empieza y termina (para el encabezado "2–7 nov"). */
  desde: number;
  hasta: number;
}

export type EstadoIncentivo = "CUMPLIDA" | "PAGA" | "NO_PAGA";

export interface IFilaIncentivo {
  codigo: string;
  producto: string;
  proveedor: string;
  incentivo: number;
  meta: number;
  /** Mínimo cargado en la meta (igual a la meta si no se indicó). */
  minimoBase: number;
  /** Mínimo para cobrar = ROUNDUP(minimoBase × % mínimo), como el libro de COAGRO. */
  minimo: number;
  semanas: number[];
  vendido: number;
  /** vendido / meta (0..∞) */
  avance: number;
  faltan: number;
  estado: EstadoIncentivo;
  ganado: number;
  aMeta: number;
}

export interface IResumenIncentivo {
  meta: number;
  minimo: number;
  semanas: number[];
  vendido: number;
  avance: number;
  incentivoAlCien: number;
  ganado: number;
  /** "PRODUCTOS CON META CUMPLIDA" del libro: los que ya pagan + los de meta cumplida. */
  cumplidas: number;
  productos: number;
}

/** Una fila del resumen por vendedor (consulta sin vendedor). */
export interface IResumenVendedor extends IResumenIncentivo {
  vendedor: string;
  nombre: string;
}

const ABREV_MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/**
 * Semanas de un mes como en el informe de COAGRO: lunes a sábado, cortadas al mes
 * (nov 2026: 2–7, 9–14, 16–21, 23–28, 30). Los días antes del primer lunes van en la semana 1 y
 * cada domingo con la semana que termina el sábado anterior.
 */
export const semanasDelMes = (anio: number, mes: number): ISemana[] => {
  const dias = new Date(anio, mes, 0).getDate();
  const semanas: ISemana[] = [];
  for (let d = 1; d <= dias; d++) {
    const dow = new Date(anio, mes - 1, d).getDay(); // 0 domingo, 1 lunes…
    if (dow === 1 || semanas.length === 0) {
      semanas.push({ numero: semanas.length + 1, desde: d, hasta: d });
    }
    if (dow !== 0) semanas[semanas.length - 1].hasta = d;
  }
  // Si el mes empieza en domingo, la semana 1 se rotula desde el primer lunes (como el informe).
  if (semanas.length > 1 && new Date(anio, mes - 1, 1).getDay() === 0 && semanas[0].desde === 1 && semanas[0].hasta === 1) {
    semanas.shift();
    semanas.forEach((s, i) => (s.numero = i + 1));
  }
  return semanas;
};

/** Índice (0..n-1) de la semana a la que pertenece un día del mes. */
const semanaDeDia = (semanas: ISemana[], dia: number): number => {
  let indice = 0;
  semanas.forEach((s, i) => {
    if (dia >= s.desde) indice = i;
  });
  return indice;
};

/**
 * Cuadro de Control → Incentivo y Metas (informe "META E INCENTIVO · MES · VENDEDOR").
 * Metas del vendedor en el mes (CINCOH.MetaVentaProducto: meta, mínimo e incentivo por unidad) contra
 * lo vendido en el ERP por semana. Sin vendedor: resumen de todos los vendedores con metas en el mes.
 * Reglas:
 *  - Avance = vendido / meta. Faltan = meta − vendido (mínimo 0).
 *  - Paga cuando vendido ≥ mínimo × "% mínimo para cobrar". Incentivo ganado = vendido × $ por unidad.
 *  - Incentivo a meta = meta × $ por unidad (lo que gana si cumple el 100 %).
 *  - Los productos salen en el orden en que se cargaron (como el Excel de metas).
 */
@Component({
  selector: "app-incentivo-metas-page",
  templateUrl: "./incentivo-metas-page.component.html",
  styleUrls: ["./incentivo-metas-page.component.scss"],
})
export class IncentivoMetasPageComponent implements OnInit {
  readonly meses = MESES;
  readonly ventasDisponibles = MetasApiService.VENTAS_BACKEND_DISPONIBLE;

  filtros: FormGroup;
  opcionesVendedores: IOpcionBuscable[] = [];
  private _nombreVendedor = new Map<string, string>();

  consultando = false;
  consultado = false;
  semanas: ISemana[] = [];
  /** Detalle del vendedor elegido. */
  filas: IFilaIncentivo[] = [];
  resumen: IResumenIncentivo | null = null;
  /** Consulta sin vendedor: una fila por vendedor. */
  vendedores: IResumenVendedor[] = [];
  totalVendedores: IResumenIncentivo | null = null;
  /** Título del informe de la última consulta. */
  titulo = "";
  /** Mes/año/vendedor/% de la última consulta (para recalcular y exportar con lo que se ve). */
  private _consulta: { anio: number; mes: number; vendedor: string | null; pct: number } | null = null;
  private _metas: IMetaVenta[] = [];
  private _ventas: IVentaDia[] = [];

  constructor(fb: FormBuilder, private _api: MetasApiService, private _snotify: SnotifyService) {
    const hoy = new Date();
    this.filtros = fb.group({
      anio: [hoy.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [hoy.getMonth() + 1, Validators.required],
      vendedor: [null],
      pctMinimo: [100, [Validators.required, Validators.min(0), Validators.max(1000)]],
    });
  }

  ngOnInit(): void {
    this._api.todosVendedores().subscribe({
      next: (lista) => {
        lista.forEach((v) => this._nombreVendedor.set(v.codigo, v.nombre));
        this.opcionesVendedores = lista.map((v) => ({ valor: v.codigo, texto: `${v.codigo} · ${v.nombre}` }));
      },
      error: (e) => this._error(`Vendedores: ${mensajeErrorHttp(e)}`),
    });
  }

  get esResumen(): boolean {
    return !!this._consulta && !this._consulta.vendedor;
  }

  consultar(): void {
    if (this.filtros.invalid) {
      this.filtros.markAllAsTouched();
      this._snotify.warning("Indique año y mes", { position: SnotifyPosition.rightTop });
      return;
    }
    const f = this.filtros.value;
    const anio = Number(f.anio);
    const mes = Number(f.mes);
    const vendedor: string | null = f.vendedor ? String(f.vendedor) : null;
    const pct = Number(f.pctMinimo);
    this.consultando = true;
    forkJoin({
      metas: this._api.todasLasMetas({ anio, mes, vendedor }),
      ventas: this._api.ventasDelMes(anio, mes, vendedor),
    })
      .pipe(finalize(() => (this.consultando = false)))
      .subscribe({
        next: ({ metas, ventas }) => {
          this._consulta = { anio, mes, vendedor, pct };
          // Orden de carga (IdMeta): igual que el Excel de metas.
          this._metas = [...metas].sort((a, b) => a.IdMeta - b.IdMeta);
          this._ventas = ventas;
          this.semanas = semanasDelMes(anio, mes);
          this._armar();
          this.consultado = true;
          if (!metas.length) {
            this._snotify.info(
              vendedor ? "Ese vendedor no tiene metas cargadas en ese mes" : "No hay metas cargadas en ese mes",
              { position: SnotifyPosition.rightTop }
            );
          }
        },
        error: (e) => this._error(mensajeErrorHttp(e)),
      });
  }

  /** Recalcula estados e incentivos al cambiar el % mínimo (sin volver a consultar). */
  recalcular(): void {
    if (!this._consulta || this.filtros.get("pctMinimo")?.invalid) return;
    this._consulta.pct = Number(this.filtros.value.pctMinimo);
    this._armar();
  }

  /** Desde el resumen por vendedor: abre el detalle de ese vendedor. */
  verVendedor(v: IResumenVendedor): void {
    this.filtros.patchValue({ vendedor: v.vendedor });
    this.consultar();
  }

  volverAResumen(): void {
    this.filtros.patchValue({ vendedor: null });
    this.consultar();
  }

  // ------------------------------------------------------------------ cálculo

  private _armar(): void {
    const c = this._consulta!;
    const porVendedor = new Map<string, IMetaVenta[]>();
    this._metas.forEach((m) => {
      const v = String(m.Vendedor).trim();
      porVendedor.set(v, [...(porVendedor.get(v) ?? []), m]);
    });
    const ventasDe = (vendedor: string) =>
      this._ventas.filter((x) => String(x.VENDEDOR).trim().toUpperCase() === vendedor.toUpperCase());

    if (c.vendedor) {
      this.filas = this._filas(this._metas, ventasDe(c.vendedor), c.pct);
      this.resumen = this._resumir(this.filas);
      const nombre = this._nombreVendedor.get(c.vendedor) ?? c.vendedor;
      this.titulo = `META E INCENTIVO · ${nombreMes(c.mes).toUpperCase()} ${c.anio} · ${nombre.toUpperCase()}`;
      this.vendedores = [];
      this.totalVendedores = null;
      return;
    }

    this.vendedores = Array.from(porVendedor.entries())
      .map(([vendedor, metas]) => ({
        vendedor,
        nombre: this._nombreVendedor.get(vendedor) ?? metas[0]?.vendedor?.NOMBRE ?? vendedor,
        ...this._resumir(this._filas(metas, ventasDe(vendedor), c.pct)),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.totalVendedores = this._sumar(this.vendedores);
    this.titulo = `META E INCENTIVO · ${nombreMes(c.mes).toUpperCase()} ${c.anio} · TODOS LOS VENDEDORES`;
    this.filas = [];
    this.resumen = null;
  }

  private _filas(metas: IMetaVenta[], ventas: IVentaDia[], pct: number): IFilaIncentivo[] {
    const porArticulo = new Map<string, number[]>();
    ventas.forEach((v) => {
      const articulo = String(v.ARTICULO).trim().toUpperCase();
      const dia = Number(v.DIA) || Number(String(v.FECHA).slice(8, 10));
      const lista = porArticulo.get(articulo) ?? this.semanas.map(() => 0);
      lista[semanaDeDia(this.semanas, dia)] += Number(v.UNIDADES) || 0;
      porArticulo.set(articulo, lista);
    });
    return metas.map((m) => {
      const codigo = String(m.Articulo).trim();
      const meta = aNumero(m.Meta_Unidades) ?? 0;
      const semanas = porArticulo.get(codigo.toUpperCase()) ?? this.semanas.map(() => 0);
      // Sin el endpoint de ventas: se usa la Venta_Unidades guardada en la meta (sin detalle semanal).
      const vendido = this.ventasDisponibles ? semanas.reduce((t, x) => t + x, 0) : aNumero(m.Venta_Unidades) ?? 0;
      const incentivo = aNumero(m.Incentivo) ?? 0;
      const minimoBase = aNumero(m.minimo) ?? meta;
      // Mismas fórmulas que el libro de COAGRO:
      //   Mínimo = ROUNDUP(base × %), Avance = vendido / meta, Faltan = MAX(0, mínimo − vendido),
      //   Estado = vendido ≥ meta → "Meta cumplida"; vendido ≥ mínimo → "Ya paga"; si no "Aún no paga",
      //   Ganado = vendido × $ si vendido ≥ mínimo.
      const minimo = Math.ceil(Number(((minimoBase * pct) / 100).toFixed(6)));
      const avance = meta > 0 ? vendido / meta : 0;
      const estado: EstadoIncentivo = vendido >= meta ? "CUMPLIDA" : vendido >= minimo ? "PAGA" : "NO_PAGA";
      return {
        codigo,
        producto: m.articulo?.DESCRIPCION?.trim() || codigo,
        proveedor: m.proveedor?.codigo?.trim() || "",
        incentivo,
        meta,
        minimoBase,
        minimo,
        semanas,
        vendido,
        avance,
        faltan: Math.max(minimo - vendido, 0),
        estado,
        ganado: estado === "NO_PAGA" ? 0 : vendido * incentivo,
        aMeta: meta * incentivo,
      };
    });
  }

  private _resumir(filas: IFilaIncentivo[]): IResumenIncentivo {
    const suma = (fn: (f: IFilaIncentivo) => number) => filas.reduce((t, f) => t + fn(f), 0);
    const meta = suma((f) => f.meta);
    const vendido = suma((f) => f.vendido);
    return {
      meta,
      minimo: suma((f) => f.minimo),
      semanas: this.semanas.map((_, i) => suma((f) => f.semanas[i] ?? 0)),
      vendido,
      avance: meta > 0 ? vendido / meta : 0,
      incentivoAlCien: suma((f) => f.aMeta),
      ganado: suma((f) => f.ganado),
      cumplidas: filas.filter((f) => f.estado !== "NO_PAGA").length,
      productos: filas.length,
    };
  }

  private _sumar(lista: IResumenIncentivo[]): IResumenIncentivo {
    const suma = (fn: (r: IResumenIncentivo) => number) => lista.reduce((t, r) => t + fn(r), 0);
    const meta = suma((r) => r.meta);
    const vendido = suma((r) => r.vendido);
    return {
      meta,
      minimo: suma((r) => r.minimo),
      semanas: this.semanas.map((_, i) => suma((r) => r.semanas[i] ?? 0)),
      vendido,
      avance: meta > 0 ? vendido / meta : 0,
      incentivoAlCien: suma((r) => r.incentivoAlCien),
      ganado: suma((r) => r.ganado),
      cumplidas: suma((r) => r.cumplidas),
      productos: suma((r) => r.productos),
    };
  }

  // ------------------------------------------------------------------ presentación

  etiquetaSemana(s: ISemana): string {
    const mes = ABREV_MES[(this._consulta?.mes ?? 1) - 1];
    return s.desde === s.hasta ? `${s.desde} ${mes}` : `${s.desde}–${s.hasta} ${mes}`;
  }

  /** Productos del vendedor sin incentivo por unidad (nota "Pendiente de confirmación" del informe). */
  get sinIncentivo(): number {
    return this.filas.filter((f) => !f.incentivo).length;
  }

  textoEstado(e: EstadoIncentivo): string {
    return e === "CUMPLIDA" ? "Meta cumplida" : e === "PAGA" ? "Ya paga" : "Aún no paga";
  }

  anchoBarra(avance: number): number {
    return Math.min(Math.round(avance * 100), 100);
  }

  /** Nota "PENDIENTE DE CONFIRMACIÓN" cuando hay productos sin incentivo por unidad. */
  private _notaPendiente(): string | null {
    const sin = this.sinIncentivo;
    if (!sin || !this._consulta) return null;
    return `Falta el incentivo por unidad de ${nombreMes(this._consulta.mes).toLowerCase()} para ${sin} de los ${this.filas.length} productos (columna «Incentivo» vacía o 0 en la carga de metas). Cuando se cargue, vuelva a subir la plantilla del periodo y descargue de nuevo este informe.`;
  }

  /**
   * Excel con el formato del libro de COAGRO (2026-10_Meta-Incentivo_Baudilio-1.xlsx): fórmulas vivas,
   * % mínimo editable, resumen, semanas en verde/amarillo, barra de avance, colores de estado y TOTAL.
   * Sin vendedor: resumen por vendedor con el mismo estilo.
   */
  exportar(): void {
    const c = this._consulta;
    if (!c) return;
    const sufijo = `${c.vendedor ?? "todos"}_${c.anio}_${String(c.mes).padStart(2, "0")}`;
    const semanas = this.semanas.map((s) => `Sem ${s.numero}\n${this.etiquetaSemana(s)}`);

    if (!this.esResumen && this.resumen) {
      const r = this.resumen;
      const blob = crearInformeIncentivoXlsx({
        titulo: this.titulo,
        pct: c.pct,
        semanas,
        filas: this.filas.map((f) => ({
          codigo: f.codigo,
          producto: f.producto,
          linea: f.proveedor,
          incentivo: f.incentivo,
          meta: f.meta,
          minimoBase: f.minimoBase,
          minimo: f.minimo,
          semanas: f.semanas,
          vendido: f.vendido,
          avance: f.avance,
          faltan: f.faltan,
          estadoTexto: this.textoEstado(f.estado),
          ganado: f.ganado,
          aMeta: f.aMeta,
        })),
        resumen: {
          meta: r.meta,
          vendido: r.vendido,
          avance: r.avance,
          incentivoAlCien: r.incentivoAlCien,
          ganado: r.ganado,
          conMetaCumplida: r.cumplidas,
          productos: r.productos,
        },
        notaPendiente: this._notaPendiente(),
      });
      descargarBlob(blob, `${c.anio}-${String(c.mes).padStart(2, "0")}_Meta-Incentivo_${c.vendedor}.xlsx`);
      return;
    }

    // ---------- Resumen por vendedor (mismo estilo)
    const t = this.totalVendedores;
    if (!t) return;
    const hoja: (ICeldaRica | null)[][] = [];
    const poner = (fila: number, col: number, celda: ICeldaRica) => ((hoja[fila - 1] ??= [])[col] = celda);
    const n = semanas.length;
    const colV = 4 + n;
    poner(1, 0, { v: this.titulo, s: E.TITULO });
    poner(1, colV, { v: "% mínimo para cobrar", s: E.ETIQUETA_GRIS });
    poner(1, colV + 1, { v: c.pct / 100, s: E.PCT_AZUL });
    const enc = ["Vendedor", "Nombre", "Productos", "Meta (u)", ...semanas, "Vendido (u)", "Avance", "Con meta cumplida", "Incentivo ganado", "Incentivo a meta"];
    enc.forEach((texto, col) => poner(3, col, { v: texto, s: col >= 4 && col < 4 + n ? E.ENC_SEMANA : E.ENC }));
    this.vendedores.forEach((v, i) => {
      const fila = 4 + i;
      const alt = i % 2 === 1;
      const est = (a: number, b: number) => (alt ? b : a);
      poner(fila, 0, { v: v.vendedor, s: est(E.CODIGO, E.CODIGO_ALT) });
      poner(fila, 1, { v: v.nombre, s: est(E.TEXTO, E.TEXTO_ALT) });
      poner(fila, 2, { v: v.productos, s: est(E.ENTERO, E.ENTERO_ALT) });
      poner(fila, 3, { v: v.meta, s: est(E.META, E.META_ALT) });
      v.semanas.forEach((x, k) => poner(fila, 4 + k, { v: x || null, s: E.SEMANA }));
      poner(fila, colV, { v: v.vendido, s: est(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT) });
      poner(fila, colV + 1, { v: v.avance, s: est(E.PCT, E.PCT_ALT) });
      poner(fila, colV + 2, { v: v.cumplidas, s: est(E.ENTERO, E.ENTERO_ALT) });
      poner(fila, colV + 3, { v: Number(v.ganado.toFixed(2)), s: est(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT) });
      poner(fila, colV + 4, { v: Number(v.incentivoAlCien.toFixed(2)), s: est(E.MONEDA, E.MONEDA_ALT) });
    });
    const ft = 4 + this.vendedores.length;
    for (let col = 0; col < enc.length; col++) poner(ft, col, { s: E.TOTAL_VACIO });
    poner(ft, 1, { v: "TOTAL", s: E.TOTAL_TEXTO });
    poner(ft, 2, { v: t.productos, s: E.TOTAL_ENTERO });
    poner(ft, 3, { v: t.meta, s: E.TOTAL_ENTERO });
    t.semanas.forEach((x, k) => poner(ft, 4 + k, { v: x, s: E.TOTAL_ENTERO }));
    poner(ft, colV, { v: t.vendido, s: E.TOTAL_ENTERO });
    poner(ft, colV + 1, { v: t.avance, s: E.TOTAL_PCT });
    poner(ft, colV + 2, { v: t.cumplidas, s: E.TOTAL_ENTERO });
    poner(ft, colV + 3, { v: Number(t.ganado.toFixed(2)), s: E.TOTAL_MONEDA });
    poner(ft, colV + 4, { v: Number(t.incentivoAlCien.toFixed(2)), s: E.TOTAL_MONEDA });
    const letra = (i: number) => String.fromCharCode(65 + i);
    const blob = crearXlsxRico(
      [
        {
          nombre: "Resumen por vendedor",
          filas: hoja,
          anchos: [10, 30, 10, 10, ...semanas.map(() => 10), 11, 10, 12, 13, 13],
          altos: { 1: 23.25, 3: 33.75 },
          fijar: { columnas: 2, filas: 3 },
          autoFiltro: `A3:${letra(enc.length - 1)}${ft - 1}`,
          formatoCondicionalXml: cfBarraAvance(`${letra(colV + 1)}4:${letra(colV + 1)}${ft - 1}`),
          sinCuadricula: true,
          ajustarPagina: true,
          filasTituloImpresion: "$3:$3",
        },
      ],
      ESTILOS_INFORME_XML
    );
    descargarBlob(blob, `${c.anio}-${String(c.mes).padStart(2, "0")}_Meta-Incentivo_Resumen.xlsx`);
  }

  private _error(mensaje: string): void {
    this._snotify.error(mensaje, { position: SnotifyPosition.rightTop, timeout: 8000 });
  }
}
