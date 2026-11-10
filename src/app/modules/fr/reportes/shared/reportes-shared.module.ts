import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "@app/angular-material-modulo";
import { RutasSharedModule } from "../../rutas/shared/rutas-shared.module";
import { RangoF1Component } from "./rango-f1/rango-f1.component";
import { MapaVisitasComponent } from "./mapa-visitas/mapa-visitas.component";

/** Piezas comunes de las pantallas de Reportes de FR (rango Desde/Hasta con selector F1, mapa de visitas). */
@NgModule({
  declarations: [RangoF1Component, MapaVisitasComponent],
  imports: [CommonModule, AngularMaterialModule, RutasSharedModule],
  exports: [RutasSharedModule, RangoF1Component, MapaVisitasComponent],
})
export class ReportesSharedModule {}
