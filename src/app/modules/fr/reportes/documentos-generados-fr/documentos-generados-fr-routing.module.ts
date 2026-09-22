import { DocumentosGeneradosFrPageComponent } from "./pages/documentos-generados-fr-page/documentos-generados-fr-page.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "@app/guards/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: DocumentosGeneradosFrPageComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentosGeneradosFrRoutingModule {}
