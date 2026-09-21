import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { LiquidacionAgentesRoutingModule } from "./liquidacion-agentes-routing.module";
import { LiquidacionAgentesPageComponent } from "./pages/liquidacion-agentes-page/liquidacion-agentes-page.component";

@NgModule({
  declarations: [LiquidacionAgentesPageComponent],
  imports: [
    CommonModule,
    LiquidacionAgentesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class LiquidacionAgentesModule {}
