import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/guards/auth.guard";
import { MotivosNoVentaPageComponent } from "./pages/motivos-no-venta-page/motivos-no-venta-page.component";

const routes: Routes = [
  {
    path: "",
    component: MotivosNoVentaPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MotivosNoVentaRoutingModule {}
