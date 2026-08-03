import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BodegaRoutingModule } from './bodega-routing.module';
import { BodegaPageComponent } from './pages/bodega-page/bodega-page.component';
import { AddBodegaComponent } from './pages/add-bodega/add-bodega.component';
import { LocalizacionPageComponent } from './pages/localizacion-page/localizacion-page.component';
import { UsuariosPageComponent } from './pages/usuarios-page/usuarios-page.component';
import { SucursalesPageComponent } from './pages/sucursales-page/sucursales-page.component';

@NgModule({
	declarations: [
		BodegaPageComponent,
		AddBodegaComponent,
		LocalizacionPageComponent,
		UsuariosPageComponent,
		SucursalesPageComponent
	],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		BodegaRoutingModule
	]
})
export class BodegaModule {}
