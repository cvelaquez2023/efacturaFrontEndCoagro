import { LiquidacionAgentesPageComponent } from "./pages/liquidacion-agentes-page/liquidacion-agentes-page.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: LiquidacionAgentesPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiquidacionAgentesRoutingModule {}
