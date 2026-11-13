import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { MetasSharedModule } from "../metas-shared/metas-shared.module";
import { AuthGuard } from "@app/guards/auth.guard";
import { LineasNegocioPageComponent } from "./pages/lineas-negocio-page/lineas-negocio-page.component";

const routes: Routes = [
  { path: "", component: LineasNegocioPageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [LineasNegocioPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes), AngularMaterialModule, MetasSharedModule],
})
export class LineasNegocioModule {}
