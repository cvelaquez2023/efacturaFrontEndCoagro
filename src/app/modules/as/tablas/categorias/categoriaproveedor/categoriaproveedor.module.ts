import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriaproveedorRoutingModule } from './categoriaproveedor-routing.module';
import { CategoriaproveedorPageComponent } from './pages/categoriaproveedor-page/categoriaproveedor-page.component';
import { AddCatProveedorPageComponent } from './pages/add-cat-proveedor-page/add-cat-proveedor-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

@NgModule({
	declarations: [CategoriaproveedorPageComponent, AddCatProveedorPageComponent],
	imports: [
		CommonModule,
		CategoriaproveedorRoutingModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class CategoriaproveedorModule {}
