import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { CierreJornadaRoutingModule } from "./cierre-jornada-routing.module";
import { CierreJornadaPageComponent } from "./pages/cierre-jornada-page/cierre-jornada-page.component";

@NgModule({
  declarations: [CierreJornadaPageComponent],
  imports: [
    CommonModule,
    CierreJornadaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class CierreJornadaModule {}
