import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParametrosModuloRoutingModule } from './parametros-modulo-routing.module';

import { HighchartsChartModule } from 'highcharts-angular';
import { ParametrosModulosASPageComponent } from './pages/parametrosModulosAS-page/parametrosModulosAS-page.component';
import { CheckCentroCostoDirective } from '@app/shared/directivas/check-centro-costo.directive';

@NgModule({
	declarations: [ParametrosModulosASPageComponent, CheckCentroCostoDirective],
	imports: [
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		ParametrosModuloRoutingModule,
		AngularMaterialModule,
		HighchartsChartModule,
		FlexLayoutModule
	]
})
export class ParametrosModuloModule {}
