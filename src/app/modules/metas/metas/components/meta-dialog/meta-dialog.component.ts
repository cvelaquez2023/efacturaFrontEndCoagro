import { Component, Inject } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SnotifyPosition, SnotifyService } from "ng-snotify";
import { ICodigoNombre } from "@app/modules/fr/administracion/condiciones-comerciales-shared/condiciones-comerciales.model";
import { MetasApiService, mensajeErrorHttp } from "../../../metas-shared/metas-api.service";
import {
  aNumero,
  CATALOGO_LIDERES,
  CATALOGO_LINEAS_NEGOCIO,
  CATALOGO_PROVEEDORES,
  estaActivo,
  ICatalogoConfig,
  ICatalogoMeta,
  ICatalogosMetas,
  IMetaVenta,
  IMetaVentaBody,
  MESES,
  primerError,
} from "../../../metas-shared/metas.model";

export interface IMetaDialogData {
  meta: IMetaVenta | null;
  catalogos: ICatalogosMetas;
}

/** Crear / editar una meta de venta. Cierra con `true` si guardó. */
@Component({
  selector: "app-meta-dialog",
  templateUrl: "./meta-dialog.component.html",
  styleUrls: ["./meta-dialog.component.scss"],
})
export class MetaDialogComponent {
  readonly meses = MESES;
  form: FormGroup;
  guardando = false;
  textoArticulo = "";

  lineas: ICatalogoMeta[];
  lideres: ICatalogoMeta[];
  proveedores: ICatalogoMeta[];

  constructor(
    fb: FormBuilder,
    private _api: MetasApiService,
    private _snotify: SnotifyService,
    private _ref: MatDialogRef<MetaDialogComponent, boolean | "eliminar">,
    @Inject(MAT_DIALOG_DATA) public data: IMetaDialogData
  ) {
    const m = data.meta;
    const c = data.catalogos;
    // Solo activos, más el valor actual si está inactivo (para no perderlo al editar).
    this.lineas = this._activos(c.lineas, CATALOGO_LINEAS_NEGOCIO, m?.IdLineaNegocio);
    this.lideres = this._activos(c.lideres, CATALOGO_LIDERES, m?.IdLider);
    this.proveedores = this._activos(c.proveedores, CATALOGO_PROVEEDORES, m?.IdProveedor);

    const hoy = new Date();
    this.form = fb.group({
      anio: [m?.Anio ?? hoy.getFullYear(), [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [m?.Mes ?? hoy.getMonth() + 1, Validators.required],
      idLineaNegocio: [m?.IdLineaNegocio ?? null, Validators.required],
      idLider: [m?.IdLider ?? null, Validators.required],
      vendedor: [m?.Vendedor ? String(m.Vendedor).trim() : null, Validators.required],
      articulo: [m?.Articulo ? String(m.Articulo).trim() : null, [Validators.required, Validators.maxLength(20)]],
      idProveedor: [m?.IdProveedor ?? null, Validators.required],
      metaUnidades: [aNumero(m?.Meta_Unidades) ?? null, [Validators.required, Validators.min(0)]],
      incentivo: [aNumero(m?.Incentivo), Validators.min(0)],
      minimo: [aNumero(m?.minimo), Validators.min(0)],
      ventaUnidades: [aNumero(m?.Venta_Unidades), Validators.min(0)],
      ventaValor: [aNumero(m?.Venta_Valor), Validators.min(0)],
    });
    if (m?.Articulo) {
      const desc = m.articulo?.DESCRIPCION;
      this.textoArticulo = desc ? `${String(m.Articulo).trim()} - ${desc}` : String(m.Articulo).trim();
    }
  }

  get esEdicion(): boolean {
    return !!this.data.meta;
  }

  /** La página pide la confirmación y elimina. */
  eliminar(): void {
    this._ref.close("eliminar");
  }

  get vendedores() {
    return this.data.catalogos.vendedores;
  }

  get articulo(): AbstractControl {
    return this.form.get("articulo")!;
  }

  /** Mensaje de ayuda cuando falta algún catálogo. */
  get catalogosVacios(): string[] {
    const faltan: string[] = [];
    if (!this.lineas.length) faltan.push("líneas de negocio");
    if (!this.lideres.length) faltan.push("líderes");
    if (!this.proveedores.length) faltan.push("proveedores");
    return faltan;
  }

  elegirArticulo(item: ICodigoNombre | null): void {
    this.articulo.setValue(item ? item.codigo : null);
    this.articulo.markAsTouched();
  }

  guardar(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      if (this.articulo.invalid) {
        this._snotify.warning("Seleccione el artículo de la lista", { position: SnotifyPosition.rightTop });
      }
      return;
    }
    const v = this.form.value;
    const body: IMetaVentaBody = {
      anio: Number(v.anio),
      mes: Number(v.mes),
      idLineaNegocio: Number(v.idLineaNegocio),
      idLider: Number(v.idLider),
      vendedor: String(v.vendedor).trim(),
      articulo: String(v.articulo).trim(),
      idProveedor: Number(v.idProveedor),
      metaUnidades: Number(v.metaUnidades),
    };
    // Incentivo vacío = 0; Mínimo vacío = igual a la meta (como en la carga por Excel).
    body.incentivo = aNumero(v.incentivo) ?? 0;
    body.minimo = aNumero(v.minimo) ?? Number(v.metaUnidades);
    if (aNumero(v.ventaUnidades) !== null) body.ventaUnidades = Number(v.ventaUnidades);
    if (aNumero(v.ventaValor) !== null) body.ventaValor = Number(v.ventaValor);

    this.guardando = true;
    const peticion = this.data.meta ? this._api.actualizarMeta(this.data.meta.IdMeta, body) : this._api.crearMeta(body);
    peticion.subscribe({
      next: (r) => {
        this.guardando = false;
        if (r.success) {
          this._snotify.info(this.esEdicion ? "La meta se actualizó" : "La meta se guardó", {
            position: SnotifyPosition.rightTop,
          });
          this._ref.close(true);
        } else {
          this._snotify.error(primerError(r.errors, "No se pudo guardar la meta"), { position: SnotifyPosition.rightTop });
        }
      },
      error: (e) => {
        this.guardando = false;
        this._snotify.error(mensajeErrorHttp(e), { position: SnotifyPosition.rightTop });
      },
    });
  }

  private _activos(lista: ICatalogoMeta[], cfg: ICatalogoConfig, actual?: number | null): ICatalogoMeta[] {
    return lista.filter((x) => estaActivo(x, cfg) || x.id === actual);
  }
}
