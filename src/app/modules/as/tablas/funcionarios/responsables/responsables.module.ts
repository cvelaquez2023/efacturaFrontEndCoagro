import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsablesRoutingModule } from './responsables-routing.module';
import { ResponsablePageComponent } from './pages/responsable-page/responsable-page.component';
import { AddComponent } from './pages/add/add.component';

@NgModule({
	declarations: [ResponsablePageComponent, AddComponent],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		ResponsablesRoutingModule
	]
})
export class ResponsablesModule {}
