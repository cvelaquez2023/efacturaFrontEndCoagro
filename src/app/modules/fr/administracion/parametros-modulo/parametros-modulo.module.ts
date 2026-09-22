import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { ParametrosModuloRoutingModule } from "./parametros-modulo-routing.module";
import { ParametrosModuloPageComponent } from "./pages/parametros-modulo-page/parametros-modulo-page.component";

@NgModule({
  declarations: [ParametrosModuloPageComponent],
  imports: [
    CommonModule,
    ParametrosModuloRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class ParametrosModuloModule {}
