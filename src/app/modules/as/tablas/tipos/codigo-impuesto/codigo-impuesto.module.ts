import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodigoImpuestoRoutingModule } from './codigo-impuesto-routing.module';
import { CodImpuestoPageComponent } from './pages/cod-impuesto-page/cod-impuesto-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { AddCodimpuestoComponent } from './pages/add-codimpuesto/add-codimpuesto.component';

@NgModule({
	declarations: [CodImpuestoPageComponent, AddCodimpuestoComponent],
	imports: [
		CommonModule,
		CodigoImpuestoRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class CodigoImpuestoModule {}
