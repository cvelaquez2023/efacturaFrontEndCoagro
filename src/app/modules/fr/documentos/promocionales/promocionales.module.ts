import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { PromocionalesPageComponent } from "./pages/promocionales-page/promocionales-page.component";

const routes: Routes = [{ path: "", component: PromocionalesPageComponent, canActivate: [AuthGuard] }];

/** FR → Documentos → Promocionales: solicitudes de material promocional de la app (GET/PUT /fr/promocional). */
@NgModule({
  declarations: [PromocionalesPageComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), AngularMaterialModule],
})
export class PromocionalesModule {}
