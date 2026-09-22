import { BitacoraSincronizacionPageComponent } from "./pages/bitacora-sincronizacion-page/bitacora-sincronizacion-page.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: BitacoraSincronizacionPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BitacoraSincronizacionRoutingModule {}
