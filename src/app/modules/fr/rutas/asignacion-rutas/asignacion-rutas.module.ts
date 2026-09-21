import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { AsignacionRutasRoutingModule } from './asignacion-rutas-routing.module';
import { AsignacionRutasPageComponent } from './pages/asignacion-rutas-page/asignacion-rutas-page.component';
import { MantenimientoAsignacionRutaComponent } from './pages/mantenimiento-asignacion-ruta/mantenimiento-asignacion-ruta.component';
import { RutasSharedModule } from '../shared/rutas-shared.module';

@NgModule({
	declarations: [AsignacionRutasPageComponent, MantenimientoAsignacionRutaComponent],
	imports: [CommonModule, AsignacionRutasRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, RutasSharedModule]
})
export class AsignacionRutasModule {}
