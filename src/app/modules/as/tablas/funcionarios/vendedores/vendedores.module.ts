import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendedoresRoutingModule } from './vendedores-routing.module';
import { VendedorPageComponent } from './pages/vendedor-page/vendedor-page.component';
import { AddComponent } from './pages/add/add.component';

@NgModule({
	declarations: [VendedorPageComponent, AddComponent],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		VendedoresRoutingModule
	]
})
export class VendedoresModule {}
