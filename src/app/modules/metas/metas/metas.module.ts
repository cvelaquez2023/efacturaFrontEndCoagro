import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { CondicionesComercialesSharedModule } from "@app/modules/fr/administracion/condiciones-comerciales-shared/condiciones-comerciales-shared.module";
import { MetasSharedModule } from "../metas-shared/metas-shared.module";
import { MetasPageComponent } from "./pages/metas-page/metas-page.component";
import { MetaDialogComponent } from "./components/meta-dialog/meta-dialog.component";
import { CargaPresupuestoComponent } from "./components/carga-presupuesto/carga-presupuesto.component";
import { ConsultaMetasComponent } from "./components/consulta-metas/consulta-metas.component";

const routes: Routes = [
  { path: "", component: MetasPageComponent, canActivate: [AuthGuard] },
];

/** Metas de venta (CINCOH.MetaVentaProducto) + Líneas de Negocio + Carga de Presupuesto. */
@NgModule({
  declarations: [MetasPageComponent, MetaDialogComponent, CargaPresupuestoComponent, ConsultaMetasComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AngularMaterialModule,
    MetasSharedModule,
    CondicionesComercialesSharedModule,
  ],
})
export class MetasModule {}
