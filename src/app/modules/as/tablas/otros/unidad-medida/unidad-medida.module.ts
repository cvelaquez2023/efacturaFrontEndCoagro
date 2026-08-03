import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnidadMedidaRoutingModule } from './unidad-medida-routing.module';
import { UnidaMedidaPageComponent } from './pages/unida-medida-page/unida-medida-page.component';
import { AddUnidaMedidaPageComponent } from './pages/add-unida-medida-page/add-unida-medida-page.component';

@NgModule({
	declarations: [UnidaMedidaPageComponent, AddUnidaMedidaPageComponent],
	imports: [
		CommonModule,
		UnidadMedidaRoutingModule,

		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class UnidadMedidaModule {}
