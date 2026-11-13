import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { ModuloMetasRoutingModule } from "./modulo-metas-routing.module";
import { ModuloMetasPageComponent } from "./pages/modulo-metas-page/modulo-metas-page.component";

/** Módulo principal "Metas": Metas de venta (con Carga de Presupuesto), Líneas de Negocio, Líderes y Proveedores. */
@NgModule({
  declarations: [ModuloMetasPageComponent],
  imports: [CommonModule, ModuloMetasRoutingModule, AngularMaterialModule],
})
export class ModuloMetasModule {}
