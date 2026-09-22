import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { BitacoraSincronizacionRoutingModule } from "./bitacora-sincronizacion-routing.module";
import { BitacoraSincronizacionPageComponent } from "./pages/bitacora-sincronizacion-page/bitacora-sincronizacion-page.component";

@NgModule({
  declarations: [BitacoraSincronizacionPageComponent],
  imports: [
    CommonModule,
    BitacoraSincronizacionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class BitacoraSincronizacionModule {}
