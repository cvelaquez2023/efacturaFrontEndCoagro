import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { ControlArchivosActualizacionesRoutingModule } from "./control-archivos-actualizaciones-routing.module";
import { ControlArchivosActualizacionesPageComponent } from "./pages/control-archivos-actualizaciones-page/control-archivos-actualizaciones-page.component";
import { AddActualizacionComponent } from "./pages/add-actualizacion/add-actualizacion.component";

@NgModule({
  declarations: [
    ControlArchivosActualizacionesPageComponent,
    AddActualizacionComponent,
  ],
  imports: [
    CommonModule,
    ControlArchivosActualizacionesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class ControlArchivosActualizacionesModule {}
