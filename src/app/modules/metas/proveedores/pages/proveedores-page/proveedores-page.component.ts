import { Component } from "@angular/core";
import { CATALOGO_PROVEEDORES } from "../../../metas-shared/metas.model";

/** Proveedores (FR → Administración): catálogo de metas de venta (/fr/proveedorMeta). */
@Component({
  selector: "app-proveedores-page",
  templateUrl: "./proveedores-page.component.html",
  styleUrls: ["./proveedores-page.component.scss"],
})
export class ProveedoresPageComponent {
  readonly config = CATALOGO_PROVEEDORES;
}
