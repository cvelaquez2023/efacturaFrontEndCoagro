import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { ReportesSharedModule } from "../shared/reportes-shared.module";

import { MotivosNoVentaRoutingModule } from "./motivos-no-venta-routing.module";
import { MotivosNoVentaPageComponent } from "./pages/motivos-no-venta-page/motivos-no-venta-page.component";

@NgModule({
  declarations: [MotivosNoVentaPageComponent],
  imports: [
    CommonModule,
    MotivosNoVentaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    ReportesSharedModule,
  ],
})
export class MotivosNoVentaModule {}
