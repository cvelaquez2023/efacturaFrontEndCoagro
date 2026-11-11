import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { from, Observable, of } from "rxjs";
import { catchError, concatMap, finalize, map, switchMap, tap } from "rxjs/operators";
import { exportarCsv } from "../../../../reportes/shared/reporte-utils";
import { MetasApiService, mensajeErrorHttp } from "../../../metas-shared/metas-api.service";
import {
  CATALOGO_LIDERES,
  CATALOGO_LINEAS_NEGOCIO,
  CATALOGO_PROVEEDORES,
  estaActivo,
  ICatalogoConfig,
  ICatalogoMeta,
  ICatalogosMetas,
  IMetaVentaBody,
  nombreMes,
  primerError,
} from "../../../metas-shared/metas.model";

type EstadoFila = "valida" | "invalida" | "procesando" | "creada" | "actualizada" | "error";

interface IFilaCarga {
  fila: number;
  anio: string;
  mes: string;
  linea: string;
  lider: string;
  vendedor: string;
  articulo: string;
  proveedor: string;
  meta: string;
  body: IMetaVentaBody | null;
  errores: string[];
  estado: EstadoFila;
  mensaje: string;
}

type CampoCsv = "anio" | "mes" | "linea" | "lider" | "vendedor" | "articulo" | "proveedor" | "meta";

/** Encabezados aceptados (normalizados: minúsculas, sin tildes, sin espacios ni símbolos). */
const ENCABEZADOS: Record<CampoCsv, string[]> = {
  anio: ["anio", "ano", "year"],
  mes: ["mes", "month"],
  linea: ["lineanegocio", "lineadenegocio", "linea"],
  lider: ["lider", "codigolider"],
  vendedor: ["vendedor", "codigovendedor"],
  articulo: ["articulo", "codigoarticulo"],
  proveedor: ["proveedor", "codigoproveedor"],
  meta: ["metaunidades", "meta", "metaunid", "unidades"],
};

const COLUMNAS_PLANTILLA = ["anio", "mes", "lineaNegocio", "lider", "vendedor", "articulo", "proveedor", "metaUnidades"];

const normalizar = (t: string): string =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** "1.234,5" / "1,234.5" / "12,5" / "12.5" → número (sin separador de miles ambiguo). */
const parsearNumero = (texto: string): number | null => {
  let t = texto.replace(/\s/g, "");
  if (!t) return null;
  const coma = t.lastIndexOf(",");
  const punto = t.lastIndexOf(".");
  if (coma >= 0 && punto >= 0) {
    t = coma > punto ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  } else if (coma >= 0) {
    t = t.replace(",", ".");
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/** Parser CSV con comillas ("a;b" y "" dentro de comillas). */
const parsearCsv = (texto: string, separador: string): string[][] => {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') {
        celda += '"';
        i++;
      } else if (c === '"') {
        enComillas = false;
      } else {
        celda += c;
      }
    } else if (c === '"') {
      enComillas = true;
    } else if (c === separador) {
      fila.push(celda);
      celda = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else {
      celda += c;
    }
  }
  if (celda !== "" || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((c) => c.trim() !== ""));
};

/**
 * Carga de Presupuesto: importa metas de venta desde un CSV (Excel → "Guardar como CSV"),
 * valida cada fila contra los catálogos y las envía una por una a POST /fr/metaVentaProducto.
 * Opcionalmente actualiza (PUT) las metas que ya existen para el mismo año/mes/vendedor/artículo.
 */
@Component({
  selector: "app-carga-presupuesto",
  templateUrl: "./carga-presupuesto.component.html",
  styleUrls: ["./carga-presupuesto.component.scss"],
})
export class CargaPresupuestoComponent implements OnChanges {
  @Input() catalogos: ICatalogosMetas = { lineas: [], lideres: [], proveedores: [], vendedores: [] };
  /** Se emite al terminar una carga. */
  @Output() cargado = new EventEmitter<void>();

  readonly columnas = ["fila", "anio", "mes", "linea", "lider", "vendedor", "articulo", "proveedor", "meta", "estado"];
  readonly nombreMes = nombreMes;

  archivo = "";
  filas: IFilaCarga[] = [];
  actualizarExistentes = false;
  procesando = false;
  procesadas = 0;
  totalCarga = 0;
  terminado = false;
  soloErrores = false;

  constructor(private _api: MetasApiService, private _snotify: SnotifyService) {}

  ngOnChanges(cambios: SimpleChanges): void {
    // Si los catálogos cambian (p. ej. se crea una línea), se revalida lo que no se ha cargado.
    if (cambios["catalogos"] && this.filas.length && !this.procesando && !this.terminado) this._validarTodo();
  }

  get validas(): number {
    return this.filas.filter((f) => f.estado === "valida").length;
  }
  get invalidas(): number {
    return this.filas.filter((f) => f.estado === "invalida").length;
  }
  get creadas(): number {
    return this.filas.filter((f) => f.estado === "creada").length;
  }
  get actualizadas(): number {
    return this.filas.filter((f) => f.estado === "actualizada").length;
  }
  get conError(): number {
    return this.filas.filter((f) => f.estado === "error").length;
  }
  get filasVisibles(): IFilaCarga[] {
    return this.soloErrores ? this.filas.filter((f) => f.estado === "invalida" || f.estado === "error") : this.filas;
  }

  descargarPlantilla(): void {
    const c = this.catalogos;
    const primero = (lista: ICatalogoMeta[], cfg: ICatalogoConfig, defecto: string) =>
      lista.find((x) => estaActivo(x, cfg))?.codigo ?? defecto;
    const ejemplo = [
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      primero(c.lineas, CATALOGO_LINEAS_NEGOCIO, "L01"),
      primero(c.lideres, CATALOGO_LIDERES, "LD01"),
      c.vendedores[0]?.codigo ?? "V01",
      "16003",
      primero(c.proveedores, CATALOGO_PROVEEDORES, "4-AGRO"),
      100,
    ];
    exportarCsv(
      "plantilla_presupuesto_metas",
      COLUMNAS_PLANTILLA.map((h, i) => ({ header: h, valor: (f: unknown[]) => f[i] })),
      [ejemplo]
    );
  }

  seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    this.archivo = file.name;
    this._leer(file, "utf-8").subscribe((texto) => {
      // Excel en Windows guarda "CSV" en ANSI: si UTF-8 deja caracteres inválidos, se relee en windows-1252.
      if (texto.includes("�")) {
        this._leer(file, "windows-1252").subscribe((t) => this._procesarTexto(t));
      } else {
        this._procesarTexto(texto);
      }
    });
  }

  limpiar(): void {
    this.archivo = "";
    this.filas = [];
    this.terminado = false;
    this.procesadas = 0;
    this.soloErrores = false;
  }

  cargar(): void {
    const pendientes = this.filas.filter((f) => f.estado === "valida" && f.body);
    if (!pendientes.length || this.procesando) return;
    this.procesando = true;
    this.procesadas = 0;
    this.totalCarga = pendientes.length;
    from(pendientes)
      .pipe(
        concatMap((f) => {
          f.estado = "procesando";
          return this._enviar(f).pipe(
            tap(([estado, mensaje]) => {
              f.estado = estado;
              f.mensaje = mensaje;
              this.procesadas++;
            })
          );
        }),
        finalize(() => {
          this.procesando = false;
          this.terminado = true;
          this._snotify.info(
            `Carga terminada: ${this.creadas} creadas, ${this.actualizadas} actualizadas, ${this.conError} con error, ${this.invalidas} omitidas.`,
            { position: SnotifyPosition.rightTop, timeout: 8000 }
          );
          this.cargado.emit();
        })
      )
      .subscribe();
  }

  descargarResultado(): void {
    exportarCsv(
      `resultado_${this.archivo.replace(/\.csv$/i, "") || "presupuesto"}`,
      [
        { header: "fila", valor: (f: IFilaCarga) => f.fila },
        ...COLUMNAS_PLANTILLA.map((h, i) => ({
          header: h,
          valor: (f: IFilaCarga) =>
            [f.anio, f.mes, f.linea, f.lider, f.vendedor, f.articulo, f.proveedor, f.meta][i],
        })),
        { header: "estado", valor: (f: IFilaCarga) => this.textoEstado(f) },
        { header: "detalle", valor: (f: IFilaCarga) => (f.errores.length ? f.errores.join(" · ") : f.mensaje) },
      ],
      this.filas
    );
  }

  textoEstado(f: IFilaCarga): string {
    const textos: Record<EstadoFila, string> = {
      valida: "Lista para cargar",
      invalida: "Con errores",
      procesando: "Cargando…",
      creada: "Creada",
      actualizada: "Actualizada",
      error: "Error",
    };
    return textos[f.estado];
  }

  // ------------------------------------------------------------------------------------

  private _leer(file: File, encoding: string): Observable<string> {
    return new Observable<string>((obs) => {
      const lector = new FileReader();
      lector.onload = () => {
        obs.next(String(lector.result ?? ""));
        obs.complete();
      };
      lector.onerror = () => {
        this._snotify.error("No se pudo leer el archivo", { position: SnotifyPosition.rightTop });
        obs.complete();
      };
      lector.readAsText(file, encoding);
    });
  }

  private _procesarTexto(texto: string): void {
    this.terminado = false;
    this.procesadas = 0;
    const limpio = texto.replace(/^﻿/, "");
    const primeraLinea = limpio.split(/\r?\n/)[0] ?? "";
    const separador =
      (primeraLinea.match(/;/g) || []).length >= (primeraLinea.match(/,/g) || []).length ? ";" : ",";
    const tabla = parsearCsv(limpio, separador);
    if (tabla.length < 2) {
      this.filas = [];
      this._snotify.warning("El archivo no tiene filas de datos", { position: SnotifyPosition.rightTop });
      return;
    }

    const encabezado = tabla[0].map(normalizar);
    const indice = {} as Record<CampoCsv, number>;
    const faltan: string[] = [];
    (Object.keys(ENCABEZADOS) as CampoCsv[]).forEach((campo) => {
      const i = encabezado.findIndex((h) => ENCABEZADOS[campo].includes(h));
      indice[campo] = i;
      if (i < 0) faltan.push(COLUMNAS_PLANTILLA[(Object.keys(ENCABEZADOS) as CampoCsv[]).indexOf(campo)]);
    });
    if (faltan.length) {
      this.filas = [];
      this._snotify.error(`Faltan columnas en el archivo: ${faltan.join(", ")}. Descargue la plantilla.`, {
        position: SnotifyPosition.rightTop,
        timeout: 8000,
      });
      return;
    }

    const celda = (fila: string[], campo: CampoCsv) => String(fila[indice[campo]] ?? "").trim();
    this.filas = tabla.slice(1).map((f, i) => ({
      fila: i + 2,
      anio: celda(f, "anio"),
      mes: celda(f, "mes"),
      linea: celda(f, "linea"),
      lider: celda(f, "lider"),
      vendedor: celda(f, "vendedor"),
      articulo: celda(f, "articulo"),
      proveedor: celda(f, "proveedor"),
      meta: celda(f, "meta"),
      body: null,
      errores: [],
      estado: "invalida" as EstadoFila,
      mensaje: "",
    }));
    this._validarTodo();
  }

  private _validarTodo(): void {
    const indexar = (lista: ICatalogoMeta[]) => new Map(lista.map((x) => [x.codigo.trim().toUpperCase(), x]));
    const lineas = indexar(this.catalogos.lineas);
    const lideres = indexar(this.catalogos.lideres);
    const proveedores = indexar(this.catalogos.proveedores);
    const vendedores = new Map(this.catalogos.vendedores.map((v) => [v.codigo.toUpperCase(), v]));
    const vistos = new Map<string, number>();

    const buscar = (
      mapa: Map<string, ICatalogoMeta>,
      codigo: string,
      cfg: ICatalogoConfig,
      errores: string[]
    ): ICatalogoMeta | null => {
      if (!codigo) {
        errores.push(`Falta ${cfg.singular}`);
        return null;
      }
      const item = mapa.get(codigo.toUpperCase());
      if (!item) errores.push(`${cfg.singular} "${codigo}" no existe`);
      else if (!estaActivo(item, cfg)) errores.push(`${cfg.singular} "${codigo}" está inactivo`);
      return item && estaActivo(item, cfg) ? item : null;
    };

    for (const f of this.filas) {
      if (f.estado !== "valida" && f.estado !== "invalida") continue;
      const errores: string[] = [];
      const anio = parsearNumero(f.anio);
      if (anio === null || !Number.isInteger(anio) || anio < 2000 || anio > 2100) errores.push("Año inválido (2000-2100)");
      const mes = parsearNumero(f.mes);
      if (mes === null || !Number.isInteger(mes) || mes < 1 || mes > 12) errores.push("Mes inválido (1-12)");
      const linea = buscar(lineas, f.linea, CATALOGO_LINEAS_NEGOCIO, errores);
      const lider = buscar(lideres, f.lider, CATALOGO_LIDERES, errores);
      const proveedor = buscar(proveedores, f.proveedor, CATALOGO_PROVEEDORES, errores);
      const vendedor = f.vendedor ? vendedores.get(f.vendedor.toUpperCase()) : undefined;
      if (!f.vendedor) errores.push("Falta vendedor");
      else if (!vendedor) errores.push(`Vendedor "${f.vendedor}" no existe o está inactivo en el ERP`);
      if (!f.articulo) errores.push("Falta artículo");
      else if (f.articulo.length > 20) errores.push("Artículo: máximo 20 caracteres");
      const meta = parsearNumero(f.meta);
      if (meta === null || meta < 0) errores.push("Meta de unidades inválida (número ≥ 0)");

      if (!errores.length) {
        const clave = `${anio}|${mes}|${vendedor!.codigo}|${f.articulo.toUpperCase()}`;
        const repetida = vistos.get(clave);
        if (repetida) errores.push(`Repetida con la fila ${repetida} (mismo año, mes, vendedor y artículo)`);
        else vistos.set(clave, f.fila);
      }

      f.errores = errores;
      f.estado = errores.length ? "invalida" : "valida";
      f.body = errores.length
        ? null
        : {
            anio: anio!,
            mes: mes!,
            idLineaNegocio: linea!.id,
            idLider: lider!.id,
            vendedor: vendedor!.codigo,
            articulo: f.articulo,
            idProveedor: proveedor!.id,
            metaUnidades: meta!,
          };
    }
  }

  /** POST; si ya existe y está marcado "actualizar", busca la meta y hace PUT. */
  private _enviar(f: IFilaCarga): Observable<[EstadoFila, string]> {
    const body = f.body!;
    return this._api.crearMeta(body).pipe(
      switchMap((r): Observable<[EstadoFila, string]> => {
        if (r.success) return of(["creada", ""]);
        const mensaje = primerError(r.errors, "No se pudo crear la meta");
        if (this.actualizarExistentes && /ya existe una meta/i.test(mensaje)) return this._actualizar(body);
        return of(["error", mensaje]);
      }),
      catchError((e) => of<[EstadoFila, string]>(["error", mensajeErrorHttp(e)]))
    );
  }

  private _actualizar(body: IMetaVentaBody): Observable<[EstadoFila, string]> {
    const filtro = { anio: body.anio, mes: body.mes, vendedor: body.vendedor, articulo: body.articulo };
    return this._api.listarMetas(filtro, 1, 100).pipe(
      map((r) =>
        (r.result || []).find(
          (m) =>
            String(m.Articulo).trim().toUpperCase() === body.articulo.toUpperCase() &&
            String(m.Vendedor).trim().toUpperCase() === body.vendedor.toUpperCase()
        )
      ),
      switchMap((existente): Observable<[EstadoFila, string]> => {
        if (!existente) return of(["error", "Ya existe, pero no se encontró para actualizarla"]);
        return this._api.actualizarMeta(existente.IdMeta, body).pipe(
          map((r): [EstadoFila, string] =>
            r.success
              ? ["actualizada", ""]
              : ["error", primerError(r.errors, "No se pudo actualizar la meta")]
          )
        );
      })
    );
  }
}
