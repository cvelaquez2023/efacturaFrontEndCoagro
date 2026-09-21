import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { AprobarDevolucionRoutingModule } from './aprobar-devolucion-routing.module';
import { AprobarDevolucionPageComponent } from './pages/aprobar-devolucion-page/aprobar-devolucion-page.component';
import { DetalleAprobarDevolucionComponent } from './pages/detalle-aprobar-devolucion/detalle-aprobar-devolucion.component';

@NgModule({
	declarations: [AprobarDevolucionPageComponent, DetalleAprobarDevolucionComponent],
	imports: [CommonModule, AprobarDevolucionRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class AprobarDevolucionModule {}
