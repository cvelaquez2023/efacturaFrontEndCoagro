import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { MetasSharedModule } from "../../metas-shared/metas-shared.module";
import { VentasDiariasPageComponent } from "./pages/ventas-diarias-page/ventas-diarias-page.component";

const routes: Routes = [{ path: "", component: VentasDiariasPageComponent, canActivate: [AuthGuard] }];

/** Cuadro de Control → Ventas Diarias: ventas del ERP por vendedor, artículo y día (en vivo). */
@NgModule({
  declarations: [VentasDiariasPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AngularMaterialModule,
    MetasSharedModule,
  ],
})
export class VentasDiariasModule {}
