import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriaarticuloRoutingModule } from './categoriaarticulo-routing.module';
import { CategoriaarticuloPageComponent } from './pages/categoriaarticulo-page/categoriaarticulo-page.component';
import { AddCatArticuloPageComponent } from './pages/add-cat-articulo-page/add-cat-articulo-page.component';

console.log('routercategoriaarticulo');
@NgModule({
	declarations: [CategoriaarticuloPageComponent, AddCatArticuloPageComponent],
	imports: [
		CommonModule,
		CategoriaarticuloRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class CategoriaarticuloModule {}
