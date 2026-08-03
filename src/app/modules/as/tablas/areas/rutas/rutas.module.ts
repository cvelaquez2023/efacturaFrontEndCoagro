import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RutasRoutingModule } from './rutas-routing.module';
import { RutaPageComponent } from './pages/ruta-page/ruta-page.component';
import { AddComponent } from './pages/add/add.component';

@NgModule({
	declarations: [RutaPageComponent, AddComponent],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		CommonModule,
		RutasRoutingModule,
		AngularMaterialModule
	]
})
export class RutasModule {}
