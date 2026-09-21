import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { CargaErpRoutingModule } from "./carga-erp-routing.module";
import { CargaErpPageComponent } from "./pages/carga-erp-page/carga-erp-page.component";

@NgModule({
  declarations: [CargaErpPageComponent],
  imports: [
    CommonModule,
    CargaErpRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class CargaErpModule {}
