import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { MetasSharedModule } from "../metas-shared/metas-shared.module";
import { AuthGuard } from "@app/guards/auth.guard";
import { LideresPageComponent } from "./pages/lideres-page/lideres-page.component";

const routes: Routes = [
  { path: "", component: LideresPageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [LideresPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes), AngularMaterialModule, MetasSharedModule],
})
export class LideresModule {}
