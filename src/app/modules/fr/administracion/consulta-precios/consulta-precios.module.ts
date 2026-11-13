import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { CondicionesComercialesSharedModule } from "../condiciones-comerciales-shared/condiciones-comerciales-shared.module";
import { ConsultaPreciosPageComponent } from "./pages/consulta-precios-page/consulta-precios-page.component";

const routes: Routes = [
  { path: "", component: ConsultaPreciosPageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [ConsultaPreciosPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CondicionesComercialesSharedModule,
  ],
})
export class ConsultaPreciosModule {}
