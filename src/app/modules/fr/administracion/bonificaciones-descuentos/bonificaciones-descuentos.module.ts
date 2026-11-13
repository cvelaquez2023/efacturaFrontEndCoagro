import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { CondicionesComercialesSharedModule } from "../condiciones-comerciales-shared/condiciones-comerciales-shared.module";
import { MetasSharedModule } from "@app/modules/metas/metas-shared/metas-shared.module";
import { BonificacionesDescuentosPageComponent } from "./pages/bonificaciones-descuentos-page/bonificaciones-descuentos-page.component";
import { TablaBonDescComponent } from "./components/tabla-bon-desc/tabla-bon-desc.component";
import { BonDescDialogComponent } from "./components/bon-desc-dialog/bon-desc-dialog.component";

const routes: Routes = [{ path: "", component: BonificacionesDescuentosPageComponent, canActivate: [AuthGuard] }];

/** FR → Administración → Bonificaciones y Descuentos (DESCUENTO_/BONIFICACION_ CLIART y NIVEL). */
@NgModule({
  declarations: [BonificacionesDescuentosPageComponent, TablaBonDescComponent, BonDescDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AngularMaterialModule,
    CondicionesComercialesSharedModule,
    MetasSharedModule,
  ],
})
export class BonificacionesDescuentosModule {}
