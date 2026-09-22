import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { CargaClientesRoutingModule } from "./carga-clientes-routing.module";
import { CargaClientesPageComponent } from "./pages/carga-clientes-page/carga-clientes-page.component";

@NgModule({
  declarations: [CargaClientesPageComponent],
  imports: [CommonModule, CargaClientesRoutingModule, AngularMaterialModule],
})
export class CargaClientesModule {}
