import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonedaRoutingModule } from './moneda-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { MonedaPageComponent } from './pages/moneda-page/moneda-page.component';
import { AddMonedaComponent } from './pages/add-moneda/add-moneda.component';

@NgModule({
	declarations: [MonedaPageComponent, AddMonedaComponent],
	imports: [
		CommonModule,
		MonedaRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class MonedaModule {}
