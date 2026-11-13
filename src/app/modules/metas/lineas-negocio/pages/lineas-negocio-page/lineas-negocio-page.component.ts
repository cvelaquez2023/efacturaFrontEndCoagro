import { Component } from "@angular/core";
import { CATALOGO_LINEAS_NEGOCIO } from "../../../metas-shared/metas.model";

/** Líneas de Negocio (módulo Metas): catálogo al que pertenece cada meta de venta (/fr/lineaNegocio). */
@Component({
  selector: "app-lineas-negocio-page",
  templateUrl: "./lineas-negocio-page.component.html",
  styleUrls: ["../../../lideres/pages/lideres-page/lideres-page.component.scss"],
})
export class LineasNegocioPageComponent {
  readonly config = CATALOGO_LINEAS_NEGOCIO;
}
