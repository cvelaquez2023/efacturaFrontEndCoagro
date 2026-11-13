import { Component, OnInit, ViewChild } from "@angular/core";
import { BuscadorErpComponent } from "../../../condiciones-comerciales-shared/buscador-erp/buscador-erp.component";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { hoyIso } from "../../../../reportes/shared/reporte-utils";
import {
  CatalogosComercialesService,
  mensajeErrorComercial,
} from "../../../condiciones-comerciales-shared/catalogos-comerciales.service";
import {
  ALCANCES,
  Alcance,
  describirCondicion,
  ESTADOS,
  EstadoRegla,
  IArticuloBusqueda,
  ICodigoNombre,
  ICondicionCliente,
  ICondicionClienteBody,
  NOMBRE_ESTADO,
} from "../../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { CondicionClienteApiService } from "../../service/condicion-cliente-api.service";

interface IGrupoCliente {
  cliente: string;
  nombre: string;
  agente: string;
  enCartera: boolean;
  rutas: string;
  condiciones: ICondicionCliente[];
}

/** Descuento máximo O precio especial: uno y solo uno. */
const unoDeDos = (grupo: AbstractControl): ValidationErrors | null => {
  const vacio = (v: unknown) => v === null || v === undefined || v === "";
  const d = grupo.get("descuentoMax")?.value;
  const p = grupo.get("precioEspecial")?.value;
  return vacio(d) === vacio(p) ? { unoDeDos: true } : null;
};

const fechasEnOrden = (grupo: AbstractControl): ValidationErrors | null => {
  const ini = grupo.get("fechaInicio")?.value;
  const fin = grupo.get("fechaFin")?.value;
  return ini && fin && fin < ini ? { fechas: true } : null;
};

/**
 * Condiciones Especiales por Cliente: aquí se autorizan los descuentos máximos o precios
 * especiales de cada cliente, por producto, línea o texto, con fecha de inicio y fin.
 */
@Component({
  selector: "app-condiciones-cliente-page",
  templateUrl: "./condiciones-cliente-page.component.html",
  styleUrls: [
    "../../../condiciones-comerciales-shared/_comercial.scss",
    "./condiciones-cliente-page.component.scss",
  ],
})
export class CondicionesClientePageComponent implements OnInit {
  constructor(
    private _fb: FormBuilder,
    private _snotify: SnotifyService,
    private _api: CondicionClienteApiService,
    private _catalogos: CatalogosComercialesService
  ) {}

  readonly modoPrueba = !CondicionClienteApiService.BACKEND_DISPONIBLE;
  readonly alcances = ALCANCES;
  readonly estados = ESTADOS;
  readonly nombreEstado = NOMBRE_ESTADO;
  readonly describir = describirCondicion;

  form!: FormGroup;
  lineas: ICodigoNombre[] = [];
  editandoId: number | null = null;
  guardando = false;
  cargando = false;
  verAyuda = false;
  @ViewChild("buscadorCliente") buscadorCliente?: BuscadorErpComponent;
  @ViewChild("buscadorArticulo") buscadorArticulo?: BuscadorErpComponent;

  todas: ICondicionCliente[] = [];
  grupos: IGrupoCliente[] = [];
  agentes: string[] = [];
  filtroTexto = "";
  filtroAgente = "";
  filtroEstado: EstadoRegla | "" = "";

  ngOnInit(): void {
    this.form = this._fb.group(
      {
        cliente: ["", Validators.required],
        clienteNombre: [""],
        alcance: ["L" as Alcance, Validators.required],
        valor: ["", Validators.required],
        valorDescripcion: [""],
        descuentoMax: [null, [Validators.min(0.01), Validators.max(100)]],
        precioEspecial: [null, [Validators.min(0.0001)]],
        cantidadMin: [null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
        fechaInicio: [hoyIso(), Validators.required],
        fechaFin: [null],
        notas: ["", Validators.maxLength(250)],
        activa: [true],
      },
      { validators: [unoDeDos, fechasEnOrden] }
    );
    this.form.get("alcance")!.valueChanges.subscribe(() => {
      this.form.patchValue({ valor: "", valorDescripcion: "" }, { emitEvent: false });
      this.buscadorArticulo?.limpiar(false);
    });
    this._catalogos.getLineas().subscribe((l) => (this.lineas = l));
    this.cargar();
  }

  get alcance(): Alcance {
    return this.form.get("alcance")!.value;
  }

  cargar(): void {
    this.cargando = true;
    this._api.getCondiciones({ fecha: hoyIso() }).subscribe({
      next: (filas) => {
        this.todas = filas;
        this.agentes = Array.from(
          new Set(filas.map((f) => f.AGENTE_NOMBRE || "").filter(Boolean))
        ).sort();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (e: unknown) => {
        this.cargando = false;
        this._error(mensajeErrorComercial(e, "No se pudieron cargar las condiciones"));
      },
    });
  }

  aplicarFiltros(): void {
    const q = this.filtroTexto.trim().toUpperCase();
    const filtradas = this.todas
      .filter((c) => !this.filtroEstado || c.ESTADO === this.filtroEstado)
      .filter((c) => !this.filtroAgente || c.AGENTE_NOMBRE === this.filtroAgente)
      .filter(
        (c) =>
          !q ||
          c.CLIENTE.toUpperCase().includes(q) ||
          c.CLIENTE_NOMBRE.toUpperCase().includes(q) ||
          c.VALOR.toUpperCase().includes(q) ||
          c.VALOR_DESCRIPCION.toUpperCase().includes(q)
      );
    const porCliente = new Map<string, IGrupoCliente>();
    filtradas.forEach((c) => {
      const g = porCliente.get(c.CLIENTE) ?? {
        cliente: c.CLIENTE,
        nombre: c.CLIENTE_NOMBRE,
        agente: c.AGENTE_NOMBRE || "",
        enCartera: c.EN_CARTERA,
        rutas: c.RUTAS,
        condiciones: [],
      };
      g.condiciones.push(c);
      porCliente.set(c.CLIENTE, g);
    });
    this.grupos = Array.from(porCliente.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
    this.grupos.forEach((g) =>
      g.condiciones.sort((a, b) => a.FECHA_INICIO.localeCompare(b.FECHA_INICIO) || a.ID - b.ID)
    );
  }

  get totalFiltradas(): number {
    return this.grupos.reduce((t, g) => t + g.condiciones.length, 0);
  }

  // ------------------------------------------------------------ formulario

  elegirCliente(item: ICodigoNombre | null): void {
    this.form.patchValue({ cliente: item?.codigo ?? "", clienteNombre: item?.nombre ?? "" });
    this.form.get("cliente")!.markAsTouched();
  }

  elegirArticulo(item: IArticuloBusqueda | ICodigoNombre | null): void {
    this.form.patchValue({ valor: item?.codigo ?? "", valorDescripcion: item?.nombre ?? "" });
    this.form.get("valor")!.markAsTouched();
  }

  /** Al escribir en uno de los dos campos, se limpia el otro (son excluyentes). */
  exclusivo(campo: "descuentoMax" | "precioEspecial"): void {
    const otro = campo === "descuentoMax" ? "precioEspecial" : "descuentoMax";
    const valor = this.form.get(campo)!.value;
    if (valor !== null && valor !== "") this.form.get(otro)!.setValue(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const errores = this.form.errors ?? {};
      this._aviso(
        errores['unoDeDos']
          ? "Indique el descuento máximo o el precio especial (solo uno)"
          : errores['fechas']
          ? "La fecha fin no puede ser menor que la fecha de inicio"
          : "Revise los campos marcados en rojo"
      );
      return;
    }
    const f = this.form.value;
    const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
    const body: ICondicionClienteBody = {
      cliente: f.cliente,
      alcance: f.alcance,
      valor: String(f.valor).trim(),
      descuentoMax: num(f.descuentoMax),
      precioEspecial: num(f.precioEspecial),
      cantidadMin: num(f.cantidadMin),
      fechaInicio: f.fechaInicio,
      fechaFin: f.fechaFin || null,
      activa: f.activa ? "S" : "N",
      notas: f.notas?.trim() || null,
    };
    const extra = { clienteNombre: f.clienteNombre, valorDescripcion: f.valorDescripcion };
    const llamada =
      this.editandoId != null
        ? this._api.updateCondicion(this.editandoId, body, extra)
        : this._api.createCondicion(body, extra);
    this.guardando = true;
    llamada.subscribe({
      next: (r) => {
        this.guardando = false;
        if (!r.success) {
          this._error(r.errors?.join(". ") || "No se pudo guardar");
          return;
        }
        this._snotify.success(
          this.editandoId != null ? "Condición actualizada" : "Condición agregada",
          { position: SnotifyPosition.rightTop }
        );
        this.cancelar();
        this.cargar();
      },
      error: (e: unknown) => {
        this.guardando = false;
        this._error(mensajeErrorComercial(e, "No se pudo guardar la condición"));
      },
    });
  }

  editar(c: ICondicionCliente): void {
    this.editandoId = c.ID;
    this.form.patchValue(
      {
        cliente: c.CLIENTE,
        clienteNombre: c.CLIENTE_NOMBRE,
        alcance: c.ALCANCE,
      },
      { emitEvent: false }
    );
    this.form.patchValue({
      valor: c.VALOR,
      valorDescripcion: c.VALOR_DESCRIPCION,
      descuentoMax: c.DESCUENTO_MAX,
      precioEspecial: c.PRECIO_ESPECIAL,
      cantidadMin: c.CANTIDAD_MIN,
      fechaInicio: c.FECHA_INICIO,
      fechaFin: c.FECHA_FIN,
      notas: c.NOTAS ?? "",
      activa: c.ACTIVA === "S",
    });
    this.buscadorCliente?.fijarTexto(`${c.CLIENTE} - ${c.CLIENTE_NOMBRE}`);
    // El buscador de artículo aparece al cambiar el alcance: se fija en el siguiente ciclo.
    setTimeout(() =>
      this.buscadorArticulo?.fijarTexto(c.ALCANCE === "A" ? `${c.VALOR} - ${c.VALOR_DESCRIPCION}` : "")
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cancelar(): void {
    this.editandoId = null;
    this.form.reset(
      {
        cliente: "",
        clienteNombre: "",
        alcance: "L",
        valor: "",
        valorDescripcion: "",
        descuentoMax: null,
        precioEspecial: null,
        cantidadMin: null,
        fechaInicio: hoyIso(),
        fechaFin: null,
        notas: "",
        activa: true,
      },
      { emitEvent: false }
    );
    this.buscadorCliente?.limpiar(false);
    this.buscadorArticulo?.limpiar(false);
  }

  quitar(c: ICondicionCliente): void {
    this._snotify.confirm(`¿Quitar "${describirCondicion(c)}" de ${c.CLIENTE_NOMBRE}?`, {
      position: SnotifyPosition.rightTop,
      buttons: [
        {
          text: "SI",
          bold: true,
          action: (toast) => {
            this._snotify.remove(toast.id);
            this._api.deleteCondicion(c.ID).subscribe({
              next: (r) => {
                if (!r.success) return this._error(r.errors?.join(". ") || "No se pudo quitar");
                this._snotify.info("Condición quitada", { position: SnotifyPosition.rightTop });
                if (this.editandoId === c.ID) this.cancelar();
                this.cargar();
              },
              error: (e: unknown) => this._error(mensajeErrorComercial(e, "No se pudo quitar")),
            });
          },
        },
        { text: "CANCELAR" },
      ],
    });
  }

  alternarActiva(c: ICondicionCliente): void {
    const body = { ...CondicionClienteApiService.aCuerpo(c), activa: c.ACTIVA === "S" ? "N" : "S" } as ICondicionClienteBody;
    this._api
      .updateCondicion(c.ID, body, { clienteNombre: c.CLIENTE_NOMBRE, valorDescripcion: c.VALOR_DESCRIPCION })
      .subscribe({
        next: (r) => {
          if (!r.success) return this._error(r.errors?.join(". ") || "No se pudo actualizar");
          this.cargar();
        },
        error: (e: unknown) => this._error(mensajeErrorComercial(e, "No se pudo actualizar")),
      });
  }

  private _aviso(texto: string): void {
    this._snotify.warning(texto, { position: SnotifyPosition.rightTop });
  }

  private _error(texto: string): void {
    this._snotify.error(texto, { position: SnotifyPosition.rightTop });
  }
}
