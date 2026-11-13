import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { Subscription } from "rxjs";
import {
  CatalogosComercialesService,
  mensajeErrorComercial,
} from "../../../condiciones-comerciales-shared/catalogos-comerciales.service";
import {
  ALCANCES,
  Alcance,
  DESTINOS,
  DestinoPromocion,
  IArticuloBusqueda,
  ICodigoNombre,
  IPromocion,
  IPromocionBody,
  TIPOS_PROMOCION,
  TipoDestino,
  TipoPromocion,
} from "../../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { PromocionApiService } from "../../service/promocion-api.service";

export interface IPromocionDialogData {
  promocion?: IPromocion;
  /** true = crear una nueva a partir de `promocion` (Duplicar). */
  duplicar?: boolean;
}

const fechasEnOrden = (grupo: AbstractControl): ValidationErrors | null => {
  const ini = grupo.get("fechaInicio")?.value;
  const fin = grupo.get("fechaFin")?.value;
  return ini && fin && fin < ini ? { fechas: true } : null;
};

@Component({
  selector: "app-promocion-dialog",
  templateUrl: "./promocion-dialog.component.html",
  styleUrls: [
    "../../../condiciones-comerciales-shared/_comercial.scss",
    "./promocion-dialog.component.scss",
  ],
})
export class PromocionDialogComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IPromocionDialogData,
    private _ref: MatDialogRef<PromocionDialogComponent, IPromocion | undefined>,
    private _fb: FormBuilder,
    private _snotify: SnotifyService,
    private _api: PromocionApiService,
    private _catalogos: CatalogosComercialesService
  ) {}

  readonly tipos = TIPOS_PROMOCION;
  readonly destinos = DESTINOS;
  readonly alcances = ALCANCES;

  form!: FormGroup;
  lineas: ICodigoNombre[] = [];
  rutas: ICodigoNombre[] = [];
  tiposCliente: ICodigoNombre[] = [];
  /** Clientes elegidos cuando el destino es 'C'. */
  clientes: ICodigoNombre[] = [];
  /** Texto inicial de cada buscador de artículo de la tabla de productos (al editar). */
  textosProducto: string[] = [];
  textoBonificado = "";
  guardando = false;
  private _subs: Subscription[] = [];

  get editando(): boolean {
    return !!this.data.promocion && !this.data.duplicar;
  }

  get productos(): FormArray {
    return this.form.get("productos") as FormArray;
  }

  get tipo(): TipoPromocion {
    return this.form.get("tipo")!.value;
  }

  get destino(): DestinoPromocion {
    return this.form.get("destino")!.value;
  }

  ngOnInit(): void {
    const p = this.data.promocion;
    this.form = this._fb.group(
      {
        titulo: [p ? (this.data.duplicar ? `${p.TITULO} (copia)` : p.TITULO) : "", [Validators.required, Validators.maxLength(120)]],
        descripcion: [p?.DESCRIPCION ?? "", Validators.maxLength(500)],
        tipo: [p?.TIPO ?? ("D" as TipoPromocion), Validators.required],
        // Al duplicar se dejan las fechas vacías para obligar a escoger la nueva temporada.
        fechaInicio: [p && !this.data.duplicar ? p.FECHA_INICIO : "", Validators.required],
        fechaFin: [p && !this.data.duplicar ? p.FECHA_FIN : "", Validators.required],
        destino: [p?.DESTINO ?? ("T" as DestinoPromocion), Validators.required],
        rutas: [p?.destinos.filter((d) => d.TIPO === "R").map((d) => d.VALOR) ?? []],
        tiposCliente: [p?.destinos.filter((d) => d.TIPO === "K").map((d) => d.VALOR) ?? []],
        articuloBonificado: [p?.ARTICULO_BONIFICADO ?? ""],
        articuloBonificadoDescripcion: [p?.ARTICULO_BONIFICADO_DESCRIPCION ?? ""],
        cantidadBonificada: [p?.CANTIDAD_BONIFICADA ?? 1, [Validators.min(1)]],
        activa: [p ? p.ACTIVA === "S" : true],
        productos: this._fb.array([]),
      },
      { validators: fechasEnOrden }
    );
    this.clientes = (p?.destinos ?? [])
      .filter((d) => d.TIPO === "C")
      .map((d) => ({ codigo: d.VALOR, nombre: d.DESCRIPCION || d.VALOR }));
    this.textoBonificado = p?.ARTICULO_BONIFICADO
      ? `${p.ARTICULO_BONIFICADO} - ${p.ARTICULO_BONIFICADO_DESCRIPCION ?? ""}`
      : "";
    (p?.productos ?? []).forEach((x) =>
      this.agregarProducto(x.ALCANCE, x.VALOR, x.VALOR_DESCRIPCION, x.CANTIDAD_MIN, x.DESCUENTO, x.PRECIO_ESPECIAL)
    );
    if (!this.productos.length) this.agregarProducto();

    this._catalogos.getLineas().subscribe((l) => (this.lineas = l));
    this._catalogos.getRutas().subscribe((r) => (this.rutas = r));
    this._catalogos.getTiposCliente().subscribe((t) => (this.tiposCliente = t));
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  agregarProducto(
    alcance: Alcance = "A",
    valor = "",
    valorDescripcion = "",
    cantidadMin: number | null = null,
    descuento: number | null = null,
    precioEspecial: number | null = null
  ): void {
    const fila = this._fb.group({
      alcance: [alcance, Validators.required],
      valor: [valor, Validators.required],
      valorDescripcion: [valorDescripcion],
      cantidadMin: [cantidadMin, [Validators.min(1)]],
      descuento: [descuento, [Validators.min(0.01), Validators.max(100)]],
      precioEspecial: [precioEspecial, [Validators.min(0.0001)]],
    });
    this._subs.push(
      fila.get("alcance")!.valueChanges.subscribe(() => {
        fila.patchValue({ valor: "", valorDescripcion: "" }, { emitEvent: false });
        const i = this.productos.controls.indexOf(fila);
        if (i >= 0) this.textosProducto[i] = "";
      })
    );
    this.productos.push(fila);
    this.textosProducto.push(alcance === "A" && valor ? `${valor} - ${valorDescripcion}` : "");
  }

  quitarProducto(i: number): void {
    this.productos.removeAt(i);
    this.textosProducto.splice(i, 1);
  }

  filaProducto(i: number): FormGroup {
    return this.productos.at(i) as FormGroup;
  }

  elegirArticuloProducto(i: number, item: IArticuloBusqueda | ICodigoNombre | null): void {
    this.filaProducto(i).patchValue({ valor: item?.codigo ?? "", valorDescripcion: item?.nombre ?? "" });
  }

  elegirBonificado(item: IArticuloBusqueda | ICodigoNombre | null): void {
    this.form.patchValue({
      articuloBonificado: item?.codigo ?? "",
      articuloBonificadoDescripcion: item?.nombre ?? "",
    });
  }

  agregarCliente(item: IArticuloBusqueda | ICodigoNombre | null): void {
    if (!item || this.clientes.some((c) => c.codigo === item.codigo)) return;
    this.clientes = [...this.clientes, { codigo: item.codigo, nombre: item.nombre }];
  }

  quitarCliente(codigo: string): void {
    this.clientes = this.clientes.filter((c) => c.codigo !== codigo);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._aviso(
        this.form.errors?.['fechas']
          ? "La fecha fin no puede ser menor que la fecha de inicio"
          : "Revise los campos marcados en rojo"
      );
      return;
    }
    const f = this.form.value;
    const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
    const tipo = f.tipo as TipoPromocion;
    const destino = f.destino as DestinoPromocion;
    const destinos: { tipo: TipoDestino; valor: string; descripcion?: string }[] =
      destino === "R"
        ? (f.rutas as string[]).map((valor) => ({
            tipo: "R",
            valor,
            descripcion: this.rutas.find((r) => r.codigo === valor)?.nombre,
          }))
        : destino === "K"
        ? (f.tiposCliente as string[]).map((valor) => ({
            tipo: "K",
            valor,
            descripcion: this.tiposCliente.find((t) => t.codigo === valor)?.nombre,
          }))
        : destino === "C"
        ? this.clientes.map((c) => ({ tipo: "C", valor: c.codigo, descripcion: c.nombre }))
        : [];
    const body: IPromocionBody = {
      titulo: String(f.titulo).trim(),
      descripcion: f.descripcion?.trim() || null,
      tipo,
      fechaInicio: f.fechaInicio,
      fechaFin: f.fechaFin,
      destino,
      articuloBonificado: tipo === "B" ? f.articuloBonificado || null : null,
      cantidadBonificada: tipo === "B" ? num(f.cantidadBonificada) : null,
      articuloBonificadoDescripcion: tipo === "B" ? f.articuloBonificadoDescripcion : undefined,
      activa: f.activa ? "S" : "N",
      productos: (f.productos as {
        alcance: Alcance;
        valor: string;
        valorDescripcion: string;
        cantidadMin: unknown;
        descuento: unknown;
        precioEspecial: unknown;
      }[]).map((x) => ({
        alcance: x.alcance,
        valor: String(x.valor ?? "").trim(),
        cantidadMin: num(x.cantidadMin),
        descuento: tipo === "D" ? num(x.descuento) : null,
        precioEspecial: tipo === "P" ? num(x.precioEspecial) : null,
        valorDescripcion: x.valorDescripcion,
      })),
      destinos,
    };
    const llamada = this.editando
      ? this._api.updatePromocion(this.data.promocion!.ID, body)
      : this._api.createPromocion(body);
    this.guardando = true;
    llamada.subscribe({
      next: (r) => {
        this.guardando = false;
        if (!r.success || !r.result) {
          this._snotify.error(r.errors?.join(". ") || "No se pudo guardar", {
            position: SnotifyPosition.rightTop,
          });
          return;
        }
        this._snotify.success(this.editando ? "Promoción actualizada" : "Promoción creada", {
          position: SnotifyPosition.rightTop,
        });
        this._ref.close(r.result);
      },
      error: (e: unknown) => {
        this.guardando = false;
        this._snotify.error(mensajeErrorComercial(e, "No se pudo guardar la promoción"), {
          position: SnotifyPosition.rightTop,
        });
      },
    });
  }

  cerrar(): void {
    this._ref.close();
  }

  private _aviso(texto: string): void {
    this._snotify.warning(texto, { position: SnotifyPosition.rightTop });
  }
}
