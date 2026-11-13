import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { AuthGuard } from "@app/guards/auth.guard";
import { CobrosPageComponent } from "./pages/cobros-page/cobros-page.component";
import { ReciboDialogComponent } from "./components/recibo-dialog/recibo-dialog.component";

const routes: Routes = [{ path: "", component: CobrosPageComponent, canActivate: [AuthGuard] }];

/** FR → Documentos → Cobros: recibos de cobro de las handhelds (GET /fr/deposito…). */
@NgModule({
  declarations: [CobrosPageComponent, ReciboDialogComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes), AngularMaterialModule],
})
export class CobrosModule {}
