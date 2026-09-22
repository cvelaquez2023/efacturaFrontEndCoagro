import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { DevolucionesRoutingModule } from "./devoluciones-routing.module";
import { DevolucionesPageComponent } from "./pages/devoluciones-page/devoluciones-page.component";
import { DefinirLoteDevolucionComponent } from "./pages/definir-lote-devolucion/definir-lote-devolucion.component";

@NgModule({
  declarations: [DevolucionesPageComponent, DefinirLoteDevolucionComponent],
  imports: [
    CommonModule,
    DevolucionesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class DevolucionesModule {}
