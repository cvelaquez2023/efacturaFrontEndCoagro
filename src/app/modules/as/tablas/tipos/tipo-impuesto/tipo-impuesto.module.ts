import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TipoImpuestoRoutingModule } from './tipo-impuesto-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { TipoImpuestoPageComponent } from './pages/tipoImpuesto-page/tipoImpuesto-page.component';
import { AddTipoImpuestoComponent } from './pages/add-tipo-impuesto/add-tipo-impuesto.component';

@NgModule({
	declarations: [TipoImpuestoPageComponent, AddTipoImpuestoComponent],
	imports: [
		CommonModule,
		TipoImpuestoRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class TipoImpuestoModule {}
