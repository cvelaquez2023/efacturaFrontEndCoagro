import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NivelprecioRoutingModule } from './nivelprecio-routing.module';

import { AddNivelPrecioPageComponent } from './pages/add-nivel-precio-page/add-nivel-precio-page.component';
import { NivelPrecioPageComponent } from './pages/nivel-precio-page/nivel-precio-page.component';

@NgModule({
	declarations: [NivelPrecioPageComponent, AddNivelPrecioPageComponent],
	imports: [
		CommonModule,
		NivelprecioRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class NivelprecioModule {}
