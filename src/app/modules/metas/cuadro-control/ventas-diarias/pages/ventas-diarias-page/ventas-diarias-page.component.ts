import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { forkJoin, Observable, of } from "rxjs";
import { finalize } from "rxjs/operators";
import { descargarBlob, letraColumna } from "../../../../metas-shared/escribir-xlsx";
import { crearXlsxRico, ICeldaRica } from "../../../../metas-shared/escribir-xlsx-rico";
import { cfBarraAvance, E, ESTILOS_INFORME_XML } from "../../../../metas-shared/estilos-informe-xlsx";
import { MetasApiService, mensajeErrorHttp } from "../../../../metas-shared/metas-api.service";
import { aNumero, IMetaVenta, IVentaDia, MESES, nombreMes } from "../../../../metas-shared/metas.model";
import { IOpcionBuscable } from "../../../../metas-shared/select-buscable/select-buscable.component";

type Medida = "UNIDADES" | "VALOR";
type Columnas = "semanas" | "dias";

/** Fila de la tabla pivote: un vendedor + artículo. */
interface IFilaPivote {
  vendedor: string;
  nombreVendedor: string;
  articulo: string;
  descripcion: string;
  /** Unidades y valor por día del mes (índice 0 = día 1). */
  unidades: number[];
  valor: number[];
  /** Meta del mismo periodo (null = sin meta). */
  meta: number | null;
}

/**
 * Cuadro de Control → Ventas Diarias. Ventas del ERP en vivo (GET /ventasDiarias) por vendedor,
 * artículo y día, en tabla pivote (semanas o días; unidades o valor), opcionalmente cruzadas con las
 * metas del mismo periodo. Los días sin venta valen 0; las devoluciones pueden dar negativos.
 * Semanas por días como el backend: 1-7 = 1, 8-14 = 2, 15-21 = 3, 22-28 = 4, 29-31 = 5.
 */
@Component({
  selector: "app-ventas-diarias-page",
  templateUrl: "./ventas-diarias-page.component.html",
  styleUrls: ["./ventas-diarias-page.component.scss"],
})
export class VentasDiariasPageComponent implements OnInit {
  readonly meses = MESES;

  filtros: FormGroup;
  opcionesVendedores: IOpcionBuscable[] = [];

  medida: Medida = "UNIDADES";
  columnas: Columnas = "semanas";

  consultando = false;
  consultado = false;
  filas: IFilaPivote[] = [];
  /** Días del mes consultado. */
  diasMes = 30;
  /** Hay columna de vendedor (consulta sin vendedor). */
  variosVendedores = false;
  titulo = "";
  private _consulta: { anio: number; mes: number; vendedor: string | null; conMetas: boolean } | null = null;

  constructor(fb: FormBuilder, private _api: MetasApiService, private _snotify: SnotifyService) {
    const hoy = new Date();
    this.filtros = fb.group({
      anio: [hoy.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [hoy.getMonth() + 1, Validators.required],
      vendedor: [null],
      articulo: [""],
      conMetas: [true],
    });
  }

  ngOnInit(): void {
    this._api.todosVendedores().subscribe({
      next: (lista) =>
        (this.opcionesVendedores = lista.map((v) => ({ valor: v.codigo, texto: `${v.codigo} · ${v.nombre}` }))),
      error: (e) => this._error(`Vendedores: ${mensajeErrorHttp(e)}`),
    });
  }

  consultar(): void {
    if (this.filtros.invalid) {
      this.filtros.markAllAsTouched();
      this._snotify.warning("Año y mes son obligatorios", { position: SnotifyPosition.rightTop });
      return;
    }
    const f = this.filtros.value;
    const anio = Number(f.anio);
    const mes = Number(f.mes);
    const vendedor: string | null = f.vendedor ? String(f.vendedor) : null;
    const articulo: string = String(f.articulo ?? "").trim();
    const conMetas = !!f.conMetas;
    this.consultando = true;
    const metas$: Observable<IMetaVenta[]> = conMetas
      ? this._api.todasLasMetas({ anio, mes, vendedor, articulo: articulo || null })
      : of([]);
    forkJoin({ ventas: this._api.ventasDelMes(anio, mes, vendedor, articulo || null), metas: metas$ })
      .pipe(finalize(() => (this.consultando = false)))
      .subscribe({
        next: ({ ventas, metas }) => {
          this._consulta = { anio, mes, vendedor, conMetas };
          this.diasMes = new Date(anio, mes, 0).getDate();
          this._armar(ventas, metas);
          this.titulo = `VENTAS DIARIAS · ${nombreMes(mes).toUpperCase()} ${anio}` + (vendedor ? ` · ${this.filas[0]?.nombreVendedor || vendedor}` : " · TODOS LOS VENDEDORES");
          this.consultado = true;
        },
        error: (e) => this._error(mensajeErrorHttp(e)),
      });
  }

  private _armar(ventas: IVentaDia[], metas: IMetaVenta[]): void {
    const dias = this.diasMes;
    const filas = new Map<string, IFilaPivote>();
    const fila = (vendedor: string, articulo: string): IFilaPivote => {
      const clave = `${vendedor}|${articulo}`.toUpperCase();
      let f = filas.get(clave);
      if (!f) {
        f = {
          vendedor,
          nombreVendedor: vendedor,
          articulo,
          descripcion: articulo,
          unidades: Array(dias).fill(0),
          valor: Array(dias).fill(0),
          meta: null,
        };
        filas.set(clave, f);
      }
      return f;
    };
    ventas.forEach((v) => {
      const f = fila(v.VENDEDOR, v.ARTICULO);
      if (v.NOMBRE_VENDEDOR) f.nombreVendedor = String(v.NOMBRE_VENDEDOR).trim();
      if (v.DESCRIPCION_ARTICULO) f.descripcion = String(v.DESCRIPCION_ARTICULO).trim();
      const d = Math.min(Math.max(Number(v.DIA), 1), dias) - 1;
      f.unidades[d] += v.UNIDADES;
      f.valor[d] += v.VALOR;
    });
    // Metas del periodo: también los artículos con meta y sin venta.
    metas.forEach((m) => {
      const f = fila(String(m.Vendedor).trim(), String(m.Articulo).trim());
      f.meta = (f.meta ?? 0) + (aNumero(m.Meta_Unidades) ?? 0);
      if (f.descripcion === f.articulo && m.articulo?.DESCRIPCION) f.descripcion = m.articulo.DESCRIPCION.trim();
      if (f.nombreVendedor === f.vendedor && m.vendedor?.NOMBRE) f.nombreVendedor = m.vendedor.NOMBRE.trim();
    });
    this.filas = Array.from(filas.values()).sort(
      (a, b) => a.nombreVendedor.localeCompare(b.nombreVendedor) || a.descripcion.localeCompare(b.descripcion)
    );
    this.variosVendedores = new Set(this.filas.map((f) => f.vendedor)).size > 1 || !this._consulta?.vendedor;
  }

  // ------------------------------------------------------------------ pivote

  /** Encabezados de las columnas de periodo (Sem 1..5 o 1..N). */
  get encabezados(): { texto: string; sub: string }[] {
    if (this.columnas === "dias") return Array.from({ length: this.diasMes }, (_, i) => ({ texto: String(i + 1), sub: "" }));
    const n = Math.ceil(this.diasMes / 7);
    return Array.from({ length: n }, (_, i) => {
      const desde = i * 7 + 1;
      const hasta = Math.min(desde + 6, this.diasMes);
      return { texto: `Sem ${i + 1}`, sub: desde === hasta ? `${desde}` : `${desde}–${hasta}` };
    });
  }

  /** Valores de la fila en las columnas visibles (semanas o días) para la medida elegida. */
  valores(f: IFilaPivote): number[] {
    const base = this.medida === "UNIDADES" ? f.unidades : f.valor;
    if (this.columnas === "dias") return base;
    const semanas = Array(Math.ceil(this.diasMes / 7)).fill(0);
    base.forEach((x, i) => (semanas[Math.floor(i / 7)] += x));
    return semanas;
  }

  total(f: IFilaPivote): number {
    return (this.medida === "UNIDADES" ? f.unidades : f.valor).reduce((t, x) => t + x, 0);
  }

  /** % avance = unidades vendidas / meta; null si no hay meta o es 0. */
  avance(f: IFilaPivote): number | null {
    if (!f.meta) return null;
    return f.unidades.reduce((t, x) => t + x, 0) / f.meta;
  }

  get totales(): number[] {
    const n = this.encabezados.length;
    const t = Array(n).fill(0);
    this.filas.forEach((f) => this.valores(f).forEach((x, i) => (t[i] += x)));
    return t;
  }

  get granTotal(): number {
    return this.filas.reduce((t, f) => t + this.total(f), 0);
  }

  get metaTotal(): number {
    return this.filas.reduce((t, f) => t + (f.meta ?? 0), 0);
  }

  get conMetas(): boolean {
    return !!this._consulta?.conMetas;
  }

  formato(x: number): string {
    if (!x) return "";
    return this.medida === "VALOR"
      ? x.toLocaleString("en-US", { style: "currency", currency: "USD" })
      : x.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  // ------------------------------------------------------------------ Excel

  /** Excel con el formato de los informes de COAGRO (azul marino, periodos en verde/amarillo, TOTAL). */
  exportar(): void {
    if (!this.filas.length || !this._consulta) return;
    const c = this._consulta;
    const unidades = this.medida === "UNIDADES";
    const periodos = this.encabezados.map((e) => (e.sub ? `${e.texto}\n${e.sub}` : e.texto));
    const hoja: (ICeldaRica | null)[][] = [];
    const poner = (fila: number, col: number, celda: ICeldaRica) => ((hoja[fila - 1] ??= [])[col] = celda);

    // Columnas
    let col = 0;
    const cVend = this.variosVendedores ? col : -1;
    if (this.variosVendedores) col += 2;
    const cArt = col;
    const cPer = cArt + 2;
    const cTot = cPer + periodos.length;
    const cMeta = this.conMetas ? cTot + 1 : -1;
    const cAv = this.conMetas ? cTot + 2 : -1;
    const ultimaCol = this.conMetas ? cAv : cTot;

    poner(1, 0, { v: this.titulo, s: E.TITULO });
    poner(2, 0, {
      v: `Medida: ${unidades ? "unidades" : "valor ($)"} · ${this.columnas === "dias" ? "por día" : "por semana (1–7, 8–14, 15–21, 22–28, 29–fin)"} · ventas del ERP (facturas menos devoluciones)`,
      s: E.ETIQUETA_GRIS,
    });
    const FE = 4;
    const enc: [number, string, number][] = [
      ...(this.variosVendedores ? ([[cVend, "Vendedor", E.ENC], [cVend + 1, "Nombre", E.ENC]] as [number, string, number][]) : []),
      [cArt, "Código", E.ENC],
      [cArt + 1, "Producto", E.ENC],
      ...periodos.map((p, i): [number, string, number] => [cPer + i, p, E.ENC_SEMANA]),
      [cTot, unidades ? "Total (u)" : "Total ($)", E.ENC],
      ...(this.conMetas ? ([[cMeta, "Meta (u)", E.ENC], [cAv, "% avance", E.ENC]] as [number, string, number][]) : []),
    ];
    enc.forEach(([k, t, st]) => poner(FE, k, { v: t, s: st }));

    this.filas.forEach((fila, i) => {
      const r = FE + 1 + i;
      const alt = i % 2 === 1;
      const est = (a: number, b: number) => (alt ? b : a);
      if (this.variosVendedores) {
        poner(r, cVend, { v: fila.vendedor, s: est(E.CODIGO, E.CODIGO_ALT) });
        poner(r, cVend + 1, { v: fila.nombreVendedor, s: est(E.TEXTO, E.TEXTO_ALT) });
      }
      poner(r, cArt, { v: fila.articulo, s: est(E.CODIGO, E.CODIGO_ALT) });
      poner(r, cArt + 1, { v: fila.descripcion, s: est(E.TEXTO, E.TEXTO_ALT) });
      this.valores(fila).forEach((x, k) =>
        poner(r, cPer + k, { v: x ? Number(x.toFixed(2)) : null, s: unidades ? E.SEMANA : est(E.MONEDA, E.MONEDA_ALT) })
      );
      const desde = `${letraColumna(cPer)}${r}`;
      const hasta = `${letraColumna(cTot - 1)}${r}`;
      poner(r, cTot, {
        f: `SUM(${desde}:${hasta})`,
        v: Number(this.total(fila).toFixed(2)),
        s: unidades ? est(E.ENTERO_NEGRITA, E.ENTERO_NEGRITA_ALT) : est(E.MONEDA_NEGRITA, E.MONEDA_NEGRITA_ALT),
      });
      if (this.conMetas) {
        poner(r, cMeta, { v: fila.meta ?? "sin meta", s: fila.meta === null ? est(E.TEXTO, E.TEXTO_ALT) : est(E.META, E.META_ALT) });
        const a = this.avance(fila);
        poner(r, cAv, { v: a === null ? "-" : a, s: est(E.PCT, E.PCT_ALT) });
      }
    });

    const ft = FE + 1 + this.filas.length;
    for (let k = 0; k <= ultimaCol; k++) poner(ft, k, { s: E.TOTAL_VACIO });
    poner(ft, cArt + 1, { v: "TOTAL", s: E.TOTAL_TEXTO });
    const sumaCol = (k: number, v: number) =>
      poner(ft, k, {
        f: `SUM(${letraColumna(k)}${FE + 1}:${letraColumna(k)}${ft - 1})`,
        v: Number(v.toFixed(2)),
        s: unidades || k === cMeta ? E.TOTAL_ENTERO : E.TOTAL_MONEDA,
      });
    this.totales.forEach((x, k) => sumaCol(cPer + k, x));
    sumaCol(cTot, this.granTotal);
    if (this.conMetas) sumaCol(cMeta, this.metaTotal);

    const anchoPeriodo = this.columnas === "dias" ? 7 : 11;
    const anchos = [
      ...(this.variosVendedores ? [10, 26] : []),
      10,
      34,
      ...periodos.map(() => anchoPeriodo),
      12,
      ...(this.conMetas ? [10, 10] : []),
    ];
    const blob = crearXlsxRico(
      [
        {
          nombre: "Ventas diarias",
          filas: hoja,
          anchos,
          altos: { 1: 23.25, [FE]: 33.75 },
          fijar: { columnas: cArt + 2, filas: FE },
          autoFiltro: `A${FE}:${letraColumna(ultimaCol)}${ft - 1}`,
          formatoCondicionalXml: this.conMetas ? cfBarraAvance(`${letraColumna(cAv)}${FE + 1}:${letraColumna(cAv)}${ft - 1}`) : "",
          sinCuadricula: true,
          ajustarPagina: true,
          filasTituloImpresion: `$${FE}:$${FE}`,
        },
      ],
      ESTILOS_INFORME_XML
    );
    descargarBlob(blob, `${c.anio}-${String(c.mes).padStart(2, "0")}_Ventas-Diarias_${c.vendedor ?? "todos"}.xlsx`);
  }

  private _error(mensaje: string): void {
    this._snotify.error(mensaje, { position: SnotifyPosition.rightTop, timeout: 8000 });
  }
}
