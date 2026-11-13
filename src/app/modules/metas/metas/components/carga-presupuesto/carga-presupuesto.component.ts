import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { crearXlsx, descargarBlob } from "../../../metas-shared/escribir-xlsx";
import { MetasApiService, mensajeErrorHttp } from "../../../metas-shared/metas-api.service";
import {
  CATALOGO_LIDERES,
  CATALOGO_LINEAS_NEGOCIO,
  CATALOGO_PROVEEDORES,
  conTildes,
  estaActivo,
  ICatalogoConfig,
  ICatalogoMeta,
  ICatalogosMetas,
  IMetaImportada,
  IResultadoImportacion,
  nombreMes,
} from "../../../metas-shared/metas.model";

/** Paso de la carga: elegir archivo → vista previa (o errores) → guardado. */
type PasoCarga = "inicio" | "validando" | "vista" | "errores" | "guardando" | "guardado";

/** Encabezados de la plantilla, en el orden del formato acordado (ver GET /consulta). */
const ENCABEZADO_PLANTILLA = [
  "Año",
  "Mes",
  "Línea",
  "Líder",
  "codVendedor",
  "codArticulos",
  "Proveedor",
  "Incentivo",
  "MetaUnidades",
  "Minimo",
];

/**
 * Carga de presupuesto (metas de venta) por Excel. El BACKEND lee, valida y guarda
 * (POST /fr/metaVentaProducto/importar):
 *  1. Se elige el .xlsx → ?validar=true devuelve la vista previa (no guarda) o los errores por fila.
 *  2. El usuario revisa resumen, proveedores nuevos y metas que se reemplazan, y confirma.
 *  3. El mismo archivo se envía sin ?validar → se guarda todo o nada.
 */
@Component({
  selector: "app-carga-presupuesto",
  templateUrl: "./carga-presupuesto.component.html",
  styleUrls: ["./carga-presupuesto.component.scss"],
})
export class CargaPresupuestoComponent {
  /** Catálogos de la pantalla de Metas (para la hoja «Catálogos» de la plantilla). */
  @Input() catalogos: ICatalogosMetas = { lineas: [], lideres: [], proveedores: [], vendedores: [] };
  /** Se emite al guardar, para refrescar la lista y los catálogos (puede haber proveedores nuevos). */
  @Output() cargado = new EventEmitter<void>();

  readonly nombreMes = nombreMes;
  readonly columnas = [
    "fila",
    "periodo",
    "linea",
    "lider",
    "vendedor",
    "articulo",
    "proveedor",
    "incentivo",
    "meta",
    "minimo",
  ];

  paso: PasoCarga = "inicio";
  archivo: File | null = null;
  resultado: IResultadoImportacion | null = null;
  errores: string[] = [];
  /** Metas de la vista previa (paginadas en la tabla). */
  metas = new MatTableDataSource<IMetaImportada>([]);

  @ViewChild(MatPaginator) set paginador(p: MatPaginator | undefined) {
    if (p) this.metas.paginator = p;
  }

  constructor(private _api: MetasApiService, private _snotify: SnotifyService) {}

  get ocupado(): boolean {
    return this.paso === "validando" || this.paso === "guardando";
  }

  get resumen() {
    return this.resultado?.resumen;
  }

  get hayProveedoresNuevos(): boolean {
    return !!this.resultado?.proveedoresNuevos?.length;
  }

  get aReemplazar(): number {
    return this.resultado?.resumen?.metasExistentesAReemplazar ?? 0;
  }

  /** Texto del backend con tildes ("ano" → "año", "articulo" → "artículo"...). */
  texto(t: string | null | undefined): string {
    return conTildes(String(t ?? ""));
  }

  // ------------------------------------------------------------------ archivo y vista previa

  seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);
    input.value = ""; // permite volver a elegir el mismo archivo
    this.procesarArchivos(archivos);
  }

  /** Toma el Excel elegido (desde aquí o desde el botón «Subir Excel» de Metas) y pide la vista previa. */
  procesarArchivos(archivos: File[]): void {
    if (!archivos.length || this.ocupado) return;
    const archivo = archivos.find((a) => /\.xlsx$/i.test(a.name));
    if (!archivo) {
      this._snotify.error("Solo se aceptan archivos de Excel .xlsx (use «Descargar plantilla»).", {
        position: SnotifyPosition.rightTop,
        timeout: 8000,
      });
      return;
    }
    if (archivos.length > 1) {
      this._snotify.warning(`Se carga un archivo a la vez: se tomó «${archivo.name}».`, {
        position: SnotifyPosition.rightTop,
      });
    }
    if (archivo.size > 10 * 1024 * 1024) {
      this._snotify.error("El archivo supera el máximo de 10 MB.", { position: SnotifyPosition.rightTop });
      return;
    }
    this.archivo = archivo;
    this._validar();
  }

  private _validar(): void {
    if (!this.archivo) return;
    this.paso = "validando";
    this.resultado = null;
    this.errores = [];
    this.metas.data = [];
    this._api.importarMetas(this.archivo, true).subscribe({
      next: (r) => {
        this.resultado = r.result ?? null;
        if (!r.success) {
          this.errores = (r.errors?.length ? r.errors : ["No se pudo validar el archivo"]).map((e) => this.texto(e));
          this.paso = "errores";
          return;
        }
        this.metas.data = r.result?.metas ?? [];
        this.paso = "vista";
      },
      error: (e) => {
        this.errores = [mensajeErrorHttp(e)];
        this.paso = "errores";
      },
    });
  }

  /** Vuelve a validar el mismo archivo (p. ej. después de crear una línea o un líder que faltaba). */
  revalidar(): void {
    this._validar();
  }

  // ------------------------------------------------------------------ confirmar y guardar

  confirmar(): void {
    if (!this.archivo || this.paso !== "vista" || !this.resumen) return;
    const avisos: string[] = [`Se guardarán ${this.resumen.filasValidas} meta(s).`];
    if (this.aReemplazar) {
      avisos.push(
        `Se reemplazarán ${this.aReemplazar} meta(s) que ya existen en los mismos periodos (año, mes y vendedor).`
      );
    }
    const nuevos = this.resultado?.proveedoresNuevos ?? [];
    if (nuevos.length) {
      avisos.push(`Se crearán ${nuevos.length} proveedor(es) nuevo(s): ${nuevos.map((p) => p.codigo).join(", ")}.`);
    }
    this._snotify.confirm(`${avisos.join(" ")} ¿Desea continuar?`, {
      position: SnotifyPosition.rightTop,
      timeout: 0,
      buttons: [
        {
          text: "SI, GUARDAR",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this._guardar();
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }

  private _guardar(): void {
    if (!this.archivo) return;
    this.paso = "guardando";
    this._api.importarMetas(this.archivo, false).subscribe({
      next: (r) => {
        if (!r.success) {
          this.errores = (r.errors?.length ? r.errors : ["No se pudo guardar"]).map((e) => this.texto(e));
          this.paso = "errores";
          return;
        }
        // La respuesta del guardado no trae las metas: se conservan las de la vista previa.
        this.resultado = { ...r.result, metas: this.resultado?.metas };
        this.paso = "guardado";
        const res = r.result?.resumen;
        this._snotify.success(
          `Se guardaron ${res?.insertadas ?? res?.filasValidas ?? 0} meta(s)` +
            (res?.reemplazadas ? ` y se reemplazaron ${res.reemplazadas} anteriores` : "") +
            ".",
          { position: SnotifyPosition.rightTop, timeout: 8000 }
        );
        this.cargado.emit();
      },
      error: (e) => {
        this.errores = [mensajeErrorHttp(e)];
        this.paso = "errores";
      },
    });
  }

  limpiar(): void {
    this.paso = "inicio";
    this.archivo = null;
    this.resultado = null;
    this.errores = [];
    this.metas.data = [];
  }

  // ------------------------------------------------------------------ plantilla

  /**
   * Plantilla en Excel (.xlsx) con el formato que lee el backend:
   *  - "Plantilla": solo los encabezados (Año, Mes, Línea, Líder, codVendedor, codArticulos,
   *    Proveedor, Incentivo, MetaUnidades, Minimo); las columnas de códigos con formato texto.
   *  - "Catálogos": códigos y nombres válidos de líneas, líderes, vendedores y proveedores.
   *  - "Instrucciones".
   * El backend lee la PRIMERA hoja con datos: «Plantilla» va primero.
   */
  descargarPlantilla(): void {
    const c = this.catalogos;
    const activos = (lista: ICatalogoMeta[], cfg: ICatalogoConfig) => lista.filter((x) => estaActivo(x, cfg));
    const lineas = activos(c.lineas, CATALOGO_LINEAS_NEGOCIO);
    const lideres = activos(c.lideres, CATALOGO_LIDERES);
    const proveedores = activos(c.proveedores, CATALOGO_PROVEEDORES);
    const vendedores = c.vendedores;

    const largo = Math.max(lineas.length, lideres.length, vendedores.length, proveedores.length);
    const catalogo: (string | null)[][] = [
      ["Línea (código)", "Línea (nombre)", "", "Líder (código)", "Líder (nombre)", "", "Vendedor (código)", "Vendedor (nombre)", "", "Proveedor (código)", "Proveedor (nombre)"],
    ];
    for (let i = 0; i < largo; i++) {
      catalogo.push([
        lineas[i]?.codigo ?? null,
        lineas[i]?.nombre ?? null,
        null,
        lideres[i]?.codigo ?? null,
        lideres[i]?.nombre ?? null,
        null,
        vendedores[i]?.codigo ?? null,
        vendedores[i]?.nombre ?? null,
        null,
        proveedores[i]?.codigo ?? null,
        proveedores[i]?.nombre ?? null,
      ]);
    }

    const instrucciones = [
      ["Cómo llenar la plantilla de metas"],
      ["1. Llene la hoja «Plantilla»: una fila por año, mes, vendedor y artículo. No cambie los encabezados ni el orden de las hojas."],
      ["2. Año (2000 a 2100) y Mes (1 a 12): obligatorios."],
      ["3. Línea y Líder: código (ej. 001). Deben existir y estar activos (hoja «Catálogos»)."],
      ["4. codVendedor: código del vendedor del ERP (ej. VBM), activo. codArticulos: código del artículo del ERP (ej. 16021)."],
      ["5. Proveedor: código (máx. 20 caracteres). Si no existe se CREA solo: revise que esté bien escrito (ej. CALOX, no CALOXX)."],
      ["6. Incentivo (opcional): incentivo por unidad, ej. 0.032. Vacío = 0."],
      ["7. MetaUnidades: meta en unidades (0 o más). Minimo (opcional): vacío = igual a MetaUnidades."],
      ["8. Todo o nada: si una fila tiene error no se guarda ninguna; el sistema indica el número de fila."],
      ["9. Volver a subir un mismo año/mes/vendedor REEMPLAZA todas sus metas anteriores."],
      ["10. Guarde el archivo como Libro de Excel (.xlsx) y súbalo con «Subir Excel» en Metas."],
    ];

    const blob = crearXlsx([
      {
        nombre: "Plantilla",
        filas: [ENCABEZADO_PLANTILLA],
        anchos: [8, 8, 10, 10, 14, 14, 14, 11, 15, 10],
        columnasTexto: [2, 3, 4, 5, 6],
      },
      {
        nombre: "Catálogos",
        filas: catalogo,
        anchos: [14, 28, 3, 14, 28, 3, 16, 34, 3, 18, 40],
        columnasTexto: [0, 3, 6, 9],
      },
      { nombre: "Instrucciones", filas: instrucciones, anchos: [120] },
    ]);
    descargarBlob(blob, "plantilla_metas.xlsx");
  }
}
