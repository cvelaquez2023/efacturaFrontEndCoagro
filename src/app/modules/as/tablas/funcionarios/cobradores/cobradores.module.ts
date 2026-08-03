import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CobradoresRoutingModule } from './cobradores-routing.module';
import { CobradorPageComponent } from './pages/cobrador-page/cobrador-page.component';
import { AddComponent } from './pages/add/add.component';

@NgModule({
	declarations: [CobradorPageComponent, AddComponent],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		CobradoresRoutingModule
	]
})
export class CobradoresModule {}
