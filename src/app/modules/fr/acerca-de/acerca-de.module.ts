import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { AcercaDeRoutingModule } from "./acerca-de-routing.module";
import { AcercaDePageComponent } from "./pages/acerca-de-page/acerca-de-page.component";

@NgModule({
  declarations: [AcercaDePageComponent],
  imports: [CommonModule, AcercaDeRoutingModule, AngularMaterialModule],
})
export class AcercaDeModule {}
