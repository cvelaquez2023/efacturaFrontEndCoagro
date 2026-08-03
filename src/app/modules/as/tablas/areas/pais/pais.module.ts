import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaisRoutingModule } from './pais-routing.module';
import { PaisPageComponent } from './pages/pais-page/pais-page.component';
import { AddPaisComponent } from './pages/add-pais/add-pais.component';

console.log('PaisModule');
@NgModule({
	declarations: [PaisPageComponent, AddPaisComponent],
	imports: [
		CommonModule,
		PaisRoutingModule,
		AngularMaterialModule,
		MatTableModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class PaisModule {}
