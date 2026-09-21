import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from './../../angular-material-modulo';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrRoutingModule } from './fr-routing.module';
import { FacturacionRutasPageComponent } from './pages/facturacion-rutas-page/facturacion-rutas-page.component';

@NgModule({
	declarations: [FacturacionRutasPageComponent],
	imports: [CommonModule, FrRoutingModule, AngularMaterialModule, FlexLayoutModule]
})
export class FrModule {}
