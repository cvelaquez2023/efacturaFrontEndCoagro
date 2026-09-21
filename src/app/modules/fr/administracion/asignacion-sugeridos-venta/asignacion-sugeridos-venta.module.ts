import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { AsignacionSugeridosVentaRoutingModule } from './asignacion-sugeridos-venta-routing.module';
import { AsignacionSugeridosVentaPageComponent } from './pages/asignacion-sugeridos-venta-page/asignacion-sugeridos-venta-page.component';
import { DetalleAsignacionSugeridoComponent } from './pages/detalle-asignacion-sugerido/detalle-asignacion-sugerido.component';

@NgModule({
	declarations: [AsignacionSugeridosVentaPageComponent, DetalleAsignacionSugeridoComponent],
	imports: [CommonModule, AsignacionSugeridosVentaRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class AsignacionSugeridosVentaModule {}
