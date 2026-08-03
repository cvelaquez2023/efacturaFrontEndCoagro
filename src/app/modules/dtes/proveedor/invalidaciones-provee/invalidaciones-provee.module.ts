import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvalidacionesProveeRoutingModule } from './invalidaciones-provee-routing.module';
import { ListarInvalidacionesComponent } from './pages/listar-invalidaciones/listar-invalidaciones.component';

@NgModule({
	declarations: [ListarInvalidacionesComponent],
	imports: [CommonModule, InvalidacionesProveeRoutingModule]
})
export class InvalidacionesProveeModule {}
