import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { hoyIso } from "../../../../reportes/shared/reporte-utils";
import {
  CatalogosComercialesService,
  mensajeErrorComercial,
} from "../../../condiciones-comerciales-shared/catalogos-comerciales.service";
import {
  fmtDinero,
  fmtFechaCorta,
  IArticuloBusqueda,
  ICodigoNombre,
  IPrecioVigente,
  IReglaCandidata,
} from "../../../condiciones-comerciales-shared/condiciones-comerciales.model";
import { PrecioVigenteApiService } from "../../service/precio-vigente-api.service";

/**
 * Consulta de Precios: para un cliente, un artículo y una fecha muestra el precio base, las reglas
 * (condiciones del cliente y promociones) que aplican ese día, cuál gana y el precio final con y sin
 * IVA. Sirve para revisar una temporada antes de que empiece.
 */
@Component({
  selector: "app-consulta-precios-page",
  templateUrl: "./consulta-precios-page.component.html",
  styleUrls: [
    "../../../condiciones-comerciales-shared/_comercial.scss",
    "./consulta-precios-page.component.scss",
  ],
})
export class ConsultaPreciosPageComponent implements OnInit {
  constructor(
    private _fb: FormBuilder,
    private _snotify: SnotifyService,
    private _api: PrecioVigenteApiService,
    private _catalogos: CatalogosComercialesService
  ) {}

  readonly modoPrueba = !PrecioVigenteApiService.BACKEND_DISPONIBLE;
  readonly dinero = fmtDinero;
  readonly fmtFecha = fmtFechaCorta;

  form!: FormGroup;
  lineas = new Map<string, string>();
  articulo: IArticuloBusqueda | null = null;
  clienteNombre = "";
  resultado: IPrecioVigente | null = null;
  consultando = false;

  ngOnInit(): void {
    this.form = this._fb.group({
      cliente: ["", Validators.required],
      articulo: ["", Validators.required],
      fecha: [hoyIso(), Validators.required],
      cantidad: [null, [Validators.min(1)]],
      precioBase: [null, [Validators.min(0)]],
    });
    this._catalogos
      .getLineas()
      .subscribe((l) => (this.lineas = new Map(l.map((x) => [x.codigo, x.nombre]))));
  }

  elegirCliente(item: ICodigoNombre | null): void {
    this.form.patchValue({ cliente: item?.codigo ?? "" });
    this.clienteNombre = item?.nombre ?? "";
    this.resultado = null;
  }

  elegirArticulo(item: IArticuloBusqueda | ICodigoNombre | null): void {
    this.articulo = (item as IArticuloBusqueda) ?? null;
    this.form.patchValue({
      articulo: item?.codigo ?? "",
      precioBase: this.articulo?.precioBase ?? null,
    });
    this.resultado = null;
  }

  nombreLinea(codigo: string | null): string {
    return codigo ? this.lineas.get(codigo) ?? codigo : "Sin línea";
  }

  consultar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._snotify.warning("Seleccione el cliente, el artículo y la fecha", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    const f = this.form.value;
    const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
    if (this.modoPrueba && num(f.precioBase) == null) {
      this._snotify.warning("Escriba un precio base de prueba para este artículo", {
        position: SnotifyPosition.rightTop,
      });
      return;
    }
    this.consultando = true;
    this._api
      .getPrecioVigente(
        { cliente: f.cliente, articulo: f.articulo, fecha: f.fecha, cantidad: num(f.cantidad) },
        {
          articuloDescripcion: this.articulo?.nombre ?? f.articulo,
          linea: this.articulo?.linea ?? null,
          precioBase: num(f.precioBase) ?? 0,
        }
      )
      .subscribe({
        next: (r) => {
          this.consultando = false;
          if (!r.success || !r.result) {
            this._snotify.error(r.errors?.join(". ") || "No se pudo calcular el precio", {
              position: SnotifyPosition.rightTop,
            });
            return;
          }
          this.resultado = r.result;
          (r.result.AVISOS ?? []).forEach((aviso) =>
            this._snotify.warning(aviso, { position: SnotifyPosition.rightTop })
          );
        },
        error: (e: unknown) => {
          this.consultando = false;
          this._snotify.error(mensajeErrorComercial(e, "No se pudo calcular el precio"), {
            position: SnotifyPosition.rightTop,
          });
        },
      });
  }

  esAplicada(c: IReglaCandidata): boolean {
    const a = this.resultado?.REGLA_APLICADA;
    return !!a && a.ORIGEN === c.ORIGEN && a.ID === c.ID && a.PRECIO_RESULTANTE === c.PRECIO_RESULTANTE;
  }

  textoRegla(c: IReglaCandidata): string {
    return c.PRECIO_ESPECIAL != null
      ? `Precio especial ${fmtDinero(c.PRECIO_ESPECIAL)}`
      : `${c.DESCUENTO ?? 0} % de descuento`;
  }

  get ahorro(): number {
    return this.resultado ? this.resultado.PRECIO_BASE - this.resultado.PRECIO_FINAL : 0;
  }
}
