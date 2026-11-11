import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { CondicionesComercialesSharedModule } from "../condiciones-comerciales-shared/condiciones-comerciales-shared.module";
import { CondicionesClientePageComponent } from "./pages/condiciones-cliente-page/condiciones-cliente-page.component";

const routes: Routes = [
  { path: "", component: CondicionesClientePageComponent, canActivate: [AuthGuard] },
];

@NgModule({
  declarations: [CondicionesClientePageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CondicionesComercialesSharedModule,
  ],
})
export class CondicionesClienteModule {}
