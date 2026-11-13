import { Component } from "@angular/core";
import { CONFIGS_BD } from "../../bon-desc.model";

/**
 * FR → Administración → Bonificaciones y Descuentos: las 4 tablas de erpadmin que baja la handheld
 * (descuento y bonificación, por cliente o por nivel de precio), cada una en su pestaña.
 */
@Component({
  selector: "app-bonificaciones-descuentos-page",
  templateUrl: "./bonificaciones-descuentos-page.component.html",
  styleUrls: ["./bonificaciones-descuentos-page.component.scss"],
})
export class BonificacionesDescuentosPageComponent {
  readonly configs = CONFIGS_BD;
}
