import { FlexLayoutModule } from '@angular/flex-layout';
import { HighchartsChartModule } from 'highcharts-angular';
import { AngularMaterialModule } from './../../angular-material-modulo';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiRoutingModule } from './ci-routing.module';
import { ControlInventarioPageComponent } from './pages/control-inventario-page/control-inventario-page.component';
import { NumberOnlyDirective } from '@app/shared/directivas/number-only.directive';

@NgModule({
	declarations: [ControlInventarioPageComponent],
	imports: [CommonModule, CiRoutingModule, AngularMaterialModule, HighchartsChartModule, FlexLayoutModule]
})
export class CiModule {}
