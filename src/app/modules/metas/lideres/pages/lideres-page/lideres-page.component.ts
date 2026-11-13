import { Component } from "@angular/core";
import { CATALOGO_LIDERES } from "../../../metas-shared/metas.model";

/** Líderes (FR → Administración): catálogo de metas de venta (/fr/lider). */
@Component({
  selector: "app-lideres-page",
  templateUrl: "./lideres-page.component.html",
  styleUrls: ["./lideres-page.component.scss"],
})
export class LideresPageComponent {
  readonly config = CATALOGO_LIDERES;
}
