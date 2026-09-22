import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { BodegasRoutingModule } from "./bodegas-routing.module";
import { BodegasPageComponent } from "./pages/bodegas-page/bodegas-page.component";
import { AddBodegaComponent } from "./pages/add-bodega/add-bodega.component";

@NgModule({
  declarations: [BodegasPageComponent, AddBodegaComponent],
  imports: [
    CommonModule,
    BodegasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class BodegasModule {}
