import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { CargaArticulosRoutingModule } from './carga-articulos-routing.module';
import { CargaArticulosPageComponent } from './pages/carga-articulos-page/carga-articulos-page.component';

@NgModule({
	declarations: [CargaArticulosPageComponent],
	imports: [CommonModule, CargaArticulosRoutingModule, AngularMaterialModule]
})
export class CargaArticulosModule {}
