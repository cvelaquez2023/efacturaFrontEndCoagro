import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DtesProveeRoutingModule } from "./dtes-provee-routing.module";
import { ListarDteProveeComponent } from "./pages/listar-dte-provee/listar-dte-provee.component";

@NgModule({
  declarations: [ListarDteProveeComponent],
  imports: [CommonModule, DtesProveeRoutingModule],
})
export class DtesProveeModule {}
