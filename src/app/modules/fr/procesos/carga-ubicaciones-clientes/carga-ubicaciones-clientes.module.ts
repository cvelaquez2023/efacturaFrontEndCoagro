import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { CargaUbicacionesClientesRoutingModule } from "./carga-ubicaciones-clientes-routing.module";
import { CargaUbicacionesClientesPageComponent } from "./pages/carga-ubicaciones-clientes-page/carga-ubicaciones-clientes-page.component";

@NgModule({
  declarations: [CargaUbicacionesClientesPageComponent],
  imports: [
    CommonModule,
    CargaUbicacionesClientesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class CargaUbicacionesClientesModule {}
