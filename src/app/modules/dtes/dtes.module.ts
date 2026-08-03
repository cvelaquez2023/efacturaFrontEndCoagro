import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DtesRoutingModule } from './dtes-routing.module';

import { ListaDtePageComponent } from './pages/lista-dte-page/lista-dte-page.component';

@NgModule({
	declarations: [ListaDtePageComponent],
	imports: [CommonModule, DtesRoutingModule]
})
export class DtesModule {}
