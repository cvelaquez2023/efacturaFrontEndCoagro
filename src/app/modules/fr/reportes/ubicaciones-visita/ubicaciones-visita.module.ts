import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { UbicacionesVisitaRoutingModule } from "./ubicaciones-visita-routing.module";
import { UbicacionesVisitaPageComponent } from "./pages/ubicaciones-visita-page/ubicaciones-visita-page.component";

@NgModule({
  declarations: [UbicacionesVisitaPageComponent],
  imports: [
    CommonModule,
    UbicacionesVisitaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class UbicacionesVisitaModule {}
