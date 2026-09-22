import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { AgentesRoutingModule } from "./agentes-routing.module";
import { AgentesPageComponent } from "./pages/agentes-page/agentes-page.component";

@NgModule({
  declarations: [AgentesPageComponent],
  imports: [
    CommonModule,
    AgentesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class AgentesModule {}
