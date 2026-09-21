import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { RutasRoutingModule } from './rutas-routing.module';
import { RutasPageComponent } from './pages/rutas-page/rutas-page.component';
import { AddRutaComponent } from './pages/add-ruta/add-ruta.component';
import { DetalleRutaComponent } from './pages/detalle-ruta/detalle-ruta.component';
import { RutasSharedModule } from '../shared/rutas-shared.module';

@NgModule({
	declarations: [RutasPageComponent, AddRutaComponent, DetalleRutaComponent],
	imports: [CommonModule, RutasRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, RutasSharedModule]
})
export class RutasModule {}
