import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProveedorRoutingModule } from './proveedor-routing.module';
import { ListaProveedorDteComponent } from './pages/lista-proveedor-dte/lista-proveedor-dte.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';

@NgModule({
	declarations: [ListaProveedorDteComponent],
	imports: [
		CommonModule,
		ProveedorRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class ProveedorModule {}
