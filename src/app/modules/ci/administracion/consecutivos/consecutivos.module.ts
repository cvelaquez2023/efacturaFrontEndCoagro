import { AddConsecutivoPageComponent } from './pages/add-consecutivo-page/add-consecutivo-page.component';
import { ConsecutivoPageComponent } from './pages/consecutivo-page/consecutivo-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConsecutivosRoutingModule } from './consecutivos-routing.module';
import { AngularMaterialModule } from '@app/angular-material-modulo';

@NgModule({
	declarations: [ConsecutivoPageComponent, AddConsecutivoPageComponent],
	imports: [
		CommonModule,
		ConsecutivosRoutingModule,
		AngularMaterialModule,
		MatTableModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class ConsecutivosModule {}
