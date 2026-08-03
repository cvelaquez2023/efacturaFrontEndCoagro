import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriaclienteRoutingModule } from './categoriacliente-routing.module';
import { CategoriaclientePageComponent } from './pages/categoriacliente-page/categoriacliente-page.component';
import { AddCatClientePageComponent } from './pages/add-cat-cliente-page/add-cat-cliente-page.component';

@NgModule({
	declarations: [CategoriaclientePageComponent, AddCatClientePageComponent],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		CategoriaclienteRoutingModule
	]
})
export class CategoriaclienteModule {}
