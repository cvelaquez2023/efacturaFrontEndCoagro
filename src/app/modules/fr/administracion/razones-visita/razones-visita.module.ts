import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { RazonesVisitaRoutingModule } from "./razones-visita-routing.module";
import { RazonesVisitaPageComponent } from "./pages/razones-visita-page/razones-visita-page.component";
import { AddRazonVisitaComponent } from "./pages/add-razon-visita/add-razon-visita.component";

@NgModule({
  declarations: [RazonesVisitaPageComponent, AddRazonVisitaComponent],
  imports: [
    CommonModule,
    RazonesVisitaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class RazonesVisitaModule {}
