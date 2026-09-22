import { CargaErpPageComponent } from "./pages/carga-erp-page/carga-erp-page.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: CargaErpPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CargaErpRoutingModule {}
