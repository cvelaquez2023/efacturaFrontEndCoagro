import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { HighchartsChartModule } from "highcharts-angular";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { MetasSharedModule } from "../../metas-shared/metas-shared.module";
import { DashboardPageComponent } from "./pages/dashboard-page/dashboard-page.component";

const routes: Routes = [{ path: "", component: DashboardPageComponent, canActivate: [AuthGuard] }];

/** Cuadro de Control → Dashboard: vista general de ventas, metas, visitas y pedidos de rutas. */
@NgModule({
  declarations: [DashboardPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AngularMaterialModule,
    MetasSharedModule,
    HighchartsChartModule,
  ],
})
export class DashboardModule {}
