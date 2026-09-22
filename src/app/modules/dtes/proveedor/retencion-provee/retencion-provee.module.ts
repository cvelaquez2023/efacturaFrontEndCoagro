import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { RetencionProveeRoutingModule } from "./retencion-provee-routing.module";
import { ListarRetencionesProveeComponent } from "./pages/listar-retenciones-provee/listar-retenciones-provee.component";

@NgModule({
  declarations: [ListarRetencionesProveeComponent],
  imports: [CommonModule, RetencionProveeRoutingModule],
})
export class RetencionProveeModule {}
