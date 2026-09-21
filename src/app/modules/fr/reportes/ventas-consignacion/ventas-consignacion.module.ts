import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { VentasConsignacionRoutingModule } from "./ventas-consignacion-routing.module";
import { VentasConsignacionPageComponent } from "./pages/ventas-consignacion-page/ventas-consignacion-page.component";

@NgModule({
  declarations: [VentasConsignacionPageComponent],
  imports: [
    CommonModule,
    VentasConsignacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class VentasConsignacionModule {}
