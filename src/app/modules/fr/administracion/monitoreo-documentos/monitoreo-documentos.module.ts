import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "@app/angular-material-modulo";

import { MonitoreoDocumentosRoutingModule } from "./monitoreo-documentos-routing.module";
import { MonitoreoDocumentosPageComponent } from "./pages/monitoreo-documentos-page/monitoreo-documentos-page.component";

@NgModule({
  declarations: [MonitoreoDocumentosPageComponent],
  imports: [
    CommonModule,
    MonitoreoDocumentosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class MonitoreoDocumentosModule {}
