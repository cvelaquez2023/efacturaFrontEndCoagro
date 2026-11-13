import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs/operators";
import { ICodigoNombre } from "../../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { forkJoin } from "rxjs";
import { ClienteAsocRtApiService } from "../../../clientes/service/cliente-asoc-rt-api.service";
import { ReportesFrApiService } from "../../../../reportes/shared/reportes-fr-api.service";
import { IOpcionBuscable } from "@app/modules/metas/metas-shared/select-buscable/select-buscable.component";
import { BonDescApiService } from "../../bon-desc-api.service";
import { ICampoBD, IConfigBD, IFilaBD, llaveDe, MONEDAS, NIVELES_PRECIO } from "../../bon-desc.model";

export interface IBonDescDialogData {
  config: IConfigBD;
  /** null = nuevo. */
  fila: IFilaBD | null;
}

const hoyIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Validaciones del rango y del descuento (iguales a las del backend). */
const validarFormulario = (g: AbstractControl): ValidationErrors | null => {
  const v = g.value as Record<string, unknown>;
  const errores: ValidationErrors = {};
  if (v["cantMin"] !== null && v["cantMax"] !== null && Number(v["cantMin"]) > Number(v["cantMax"])) errores["cantidades"] = true;
  if (v["fechaInicio"] && v["fechaFin"] && String(v["fechaInicio"]) > String(v["fechaFin"])) errores["fechas"] = true;
  if (v["tipo"] === "P" && Number(v["monto"]) > 100) errores["porcentaje"] = true;
  return Object.keys(errores).length ? errores : null;
};

/** Crear / editar un descuento o una bonificación (la entidad solo se elige al crear). */
@Component({
  selector: "app-bon-desc-dialog",
  templateUrl: "./bon-desc-dialog.component.html",
  styleUrls: ["./bon-desc-dialog.component.scss"],
})
export class BonDescDialogComponent implements OnInit {
  readonly cfg: IConfigBD;
  readonly niveles = NIVELES_PRECIO;
  readonly monedas = MONEDAS;
  readonly esEdicion: boolean;
  form: FormGroup;
  guardando = false;
  errores: string[] = [];
  /** Texto a mostrar en los buscadores (cliente/artículo) al editar. */
  textos: Record<string, string> = {};
  /**
   * Clientes ASIGNADOS a una ruta (RUTA_CLIENTE): son exactamente los de erpadmin.cliente que baja la
   * handheld y contra los que valida el backend (~174 de ~5,700 del ERP). Un cliente registrado en FR
   * pero sin ruta asignada (CLIENTE_RT) no está en la handheld y el backend lo rechaza.
   */
  clientesRuta: IOpcionBuscable[] = [];
  cargandoClientes = false;

  constructor(
    fb: FormBuilder,
    private _api: BonDescApiService,
    private _clientesRt: ClienteAsocRtApiService,
    private _reportes: ReportesFrApiService,
    private _ref: MatDialogRef<BonDescDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: IBonDescDialogData
  ) {
    this.cfg = data.config;
    const f = data.fila;
    this.esEdicion = !!f;
    const anio = new Date().getFullYear();
    const controles: Record<string, unknown[]> = {
      cantMin: [f ? Number(f.CANT_MIN) : 1, [Validators.required, Validators.min(0)]],
      cantMax: [f ? Number(f.CANT_MAX) : 999999, [Validators.required, Validators.min(0)]],
      fechaInicio: [f ? String(f.FECHA_INICIO).slice(0, 10) : hoyIso(), Validators.required],
      fechaFin: [f ? String(f.FECHA_FIN).slice(0, 10) : `${anio}-12-31`, Validators.required],
    };
    [...this.cfg.entidad, ...this.cfg.valores].forEach((c) => {
      const actual = f ? f[c.columna] : null;
      let inicial: unknown = actual ?? null;
      if (!f && c.tipo === "moneda") inicial = "D";
      if (!f && c.tipo === "tipoDescuento") inicial = "P";
      const validadores = [];
      if (c.obligatorio) validadores.push(Validators.required);
      if (c.tipo === "numero" || c.tipo === "porcentaje") validadores.push(Validators.min(0));
      if (c.tipo === "porcentaje") validadores.push(Validators.max(100));
      controles[c.clave] = [{ value: inicial === null ? null : typeof inicial === "string" ? inicial.trim() : inicial, disabled: !!f && this.cfg.entidad.includes(c) }, validadores];
      if (f && (c.tipo === "cliente" || c.tipo === "articulo")) {
        const nombre =
          c.columna === "CLIENTE" ? f.NOMBRE_CLIENTE : c.columna === "ARTICULO" ? f.DESCRIPCION_ARTICULO : f.DESCRIPCION_ARTICULO_BONIF;
        this.textos[c.clave] = nombre ? `${String(actual).trim()} - ${nombre}` : String(actual ?? "").trim();
      }
    });
    this.form = fb.group(controles, { validators: validarFormulario });
  }

  ngOnInit(): void {
    if (this.esEdicion || !this.cfg.entidad.some((c) => c.tipo === "cliente")) return;
    this.cargandoClientes = true;
    forkJoin({ clientes: this._clientesRt.getClientesConNombre(), asignados: this._reportes.getRutaClientes() }).subscribe({
      next: ({ clientes, asignados }) => {
        this.cargandoClientes = false;
        const enRuta = new Set(asignados.map((a) => String(a.CLIENTE).trim()));
        const nombre = new Map((clientes.result || []).map((c) => [String(c.CODIGO).trim(), String(c.NOMBRE ?? "").trim()]));
        this.clientesRuta = [...enRuta]
          .filter(Boolean)
          .map((codigo) => ({ codigo, nombre: nombre.get(codigo) ?? "" }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((c) => ({ valor: c.codigo, texto: c.nombre ? `${c.codigo} · ${c.nombre}` : c.codigo }));
      },
      error: () => (this.cargandoClientes = false),
    });
  }

  get campos(): ICampoBD[] {
    return [...this.cfg.entidad, ...this.cfg.valores];
  }

  esEntidad(c: ICampoBD): boolean {
    return this.cfg.entidad.includes(c);
  }

  /** El monto es porcentaje (tipo P) o monto fijo (F). */
  get etiquetaMonto(): string {
    return this.form.get("tipo")?.value === "F" ? "Monto fijo ($)" : "Porcentaje (%)";
  }

  elegir(c: ICampoBD, item: ICodigoNombre | null): void {
    const control = this.form.get(c.clave);
    control?.setValue(item ? item.codigo : null);
    control?.markAsTouched();
  }

  /** Al elegir el nivel se pone su moneda (todos los niveles de NIVEL_LISTA son en dólares). */
  elegirNivel(nivel: string): void {
    const n = this.niveles.find((x) => x.nivel === nivel);
    if (n) this.form.get("moneda")?.setValue(n.moneda);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue() as Record<string, unknown>;
    const body: Record<string, unknown> = {
      cantMin: Number(v["cantMin"]),
      cantMax: Number(v["cantMax"]),
      fechaInicio: v["fechaInicio"],
      fechaFin: v["fechaFin"],
    };
    this.cfg.valores.forEach((c) => {
      const valor = v[c.clave];
      if (valor === null || valor === undefined || valor === "") {
        if (this.esEdicion && !c.obligatorio) body[c.clave] = null;
        return;
      }
      body[c.clave] = c.tipo === "numero" || c.tipo === "porcentaje" ? Number(valor) : String(valor).trim();
    });
    if (!this.esEdicion) this.cfg.entidad.forEach((c) => (body[c.clave] = String(v[c.clave] ?? "").trim()));

    this.guardando = true;
    this.errores = [];
    const peticion = this.esEdicion
      ? this._api.actualizar(this.cfg, llaveDe(this.cfg, this.data.fila!), body)
      : this._api.crear(this.cfg, body);
    peticion.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: (r) => {
        if (!r.success) {
          this.errores = r.errors?.length ? r.errors : ["No se pudo guardar"];
          return;
        }
        this._ref.close(true);
      },
      error: (e: unknown) => {
        const errs = e instanceof HttpErrorResponse ? (e.error as { errors?: string[] } | null)?.errors : null;
        this.errores = errs?.length ? errs : ["No se pudo conectar con el servidor"];
      },
    });
  }
}
