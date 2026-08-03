import { AngularMaterialModule } from './../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeriodosContableRoutingModule } from './periodos-contable-routing.module';
import { PeriodoContablePageComponent } from './pages/periodo-contable-page/periodo-contable-page.component';
import { EstadoPipe } from './pipe/estado.pipe';
import { ContabilidadPipe } from './pipe/contabilidad.pipe';
import { AddPeriodoContablePageComponent } from './pages/add-periodo-contable-page/add-periodo-contable-page.component';

@NgModule({
	declarations: [PeriodoContablePageComponent, EstadoPipe, ContabilidadPipe, AddPeriodoContablePageComponent],
	imports: [
		CommonModule,
		PeriodosContableRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class PeriodosContableModule {}
