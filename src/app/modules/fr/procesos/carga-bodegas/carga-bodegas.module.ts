import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { CargaBodegasRoutingModule } from './carga-bodegas-routing.module';
import { CargaBodegasPageComponent } from './pages/carga-bodegas-page/carga-bodegas-page.component';

@NgModule({
	declarations: [CargaBodegasPageComponent],
	imports: [CommonModule, CargaBodegasRoutingModule, AngularMaterialModule]
})
export class CargaBodegasModule {}
