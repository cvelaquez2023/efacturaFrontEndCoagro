import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { MetasSharedModule } from "../../metas-shared/metas-shared.module";
import { IncentivoMetasPageComponent } from "./pages/incentivo-metas-page/incentivo-metas-page.component";

const routes: Routes = [{ path: "", component: IncentivoMetasPageComponent, canActivate: [AuthGuard] }];

/** Cuadro de Control → Incentivo y Metas: avance de ventas del vendedor contra su meta e incentivo. */
@NgModule({
  declarations: [IncentivoMetasPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    AngularMaterialModule,
    MetasSharedModule,
  ],
})
export class IncentivoMetasModule {}
