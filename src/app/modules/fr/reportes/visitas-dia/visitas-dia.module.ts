import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { ReportesSharedModule } from "../shared/reportes-shared.module";

import { VisitasDiaRoutingModule } from "./visitas-dia-routing.module";
import { VisitasDiaPageComponent } from "./pages/visitas-dia-page/visitas-dia-page.component";

@NgModule({
  declarations: [VisitasDiaPageComponent],
  imports: [
    CommonModule,
    VisitasDiaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    ReportesSharedModule,
  ],
})
export class VisitasDiaModule {}
