import { MonitoreoDocumentosPageComponent } from "./pages/monitoreo-documentos-page/monitoreo-documentos-page.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: MonitoreoDocumentosPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonitoreoDocumentosRoutingModule {}
