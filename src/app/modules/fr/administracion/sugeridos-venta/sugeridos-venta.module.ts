import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { SugeridosVentaRoutingModule } from "./sugeridos-venta-routing.module";
import { SugeridosVentaPageComponent } from "./pages/sugeridos-venta-page/sugeridos-venta-page.component";
import { AddSugeridoVentaComponent } from "./pages/add-sugerido-venta/add-sugerido-venta.component";

@NgModule({
  declarations: [SugeridosVentaPageComponent, AddSugeridoVentaComponent],
  imports: [
    CommonModule,
    SugeridosVentaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class SugeridosVentaModule {}
