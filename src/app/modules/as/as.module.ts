import { FlexLayoutModule } from '@angular/flex-layout';
import { HighchartsChartModule } from 'highcharts-angular';
import { AngularMaterialModule } from './../../angular-material-modulo';
import { AsPageComponent } from './pages/as-page/as-page/as-page.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AsRoutingModule } from './as-routing.module';
import { AreaComponent } from './componetes/widgets/area/area.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
	declarations: [AsPageComponent, AreaComponent],
	imports: [
		MatTabsModule,
		CommonModule,
		AsRoutingModule,
		AngularMaterialModule,
		HighchartsChartModule,
		FlexLayoutModule
	]
})
export class AsModule {}
