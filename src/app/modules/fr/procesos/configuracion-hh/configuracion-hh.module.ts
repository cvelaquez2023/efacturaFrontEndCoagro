import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { ConfiguracionHhRoutingModule } from "./configuracion-hh-routing.module";
import { ConfiguracionHhPageComponent } from "./pages/configuracion-hh-page/configuracion-hh-page.component";

@NgModule({
  declarations: [ConfiguracionHhPageComponent],
  imports: [
    CommonModule,
    ConfiguracionHhRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class ConfiguracionHhModule {}
