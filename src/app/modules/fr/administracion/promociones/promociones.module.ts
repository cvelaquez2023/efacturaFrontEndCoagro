import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { CondicionesComercialesSharedModule } from "../condiciones-comerciales-shared/condiciones-comerciales-shared.module";
import { PromocionesPageComponent } from "./pages/promociones-page/promociones-page.component";
import { PromocionDialogComponent } from "./pages/promocion-dialog/promocion-dialog.component";

const routes: Routes = [
  { path: "", component: PromocionesPageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [PromocionesPageComponent, PromocionDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CondicionesComercialesSharedModule,
  ],
})
export class PromocionesModule {}
