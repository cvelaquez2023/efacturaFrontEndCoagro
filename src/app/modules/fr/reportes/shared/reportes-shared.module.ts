import { NgModule } from "@angular/core";
import { RutasSharedModule } from "../../rutas/shared/rutas-shared.module";
import { RangoF1Component } from "./rango-f1/rango-f1.component";

/** Piezas comunes de las pantallas de Reportes de FR (rango Desde/Hasta con selector F1). */
@NgModule({
  declarations: [RangoF1Component],
  imports: [RutasSharedModule],
  exports: [RutasSharedModule, RangoF1Component],
})
export class ReportesSharedModule {}
