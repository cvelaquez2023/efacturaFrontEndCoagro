import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CentrocuentaRoutingModule } from './centrocuenta-routing.module';
import { CentrocuentaPageComponent } from './pages/centrocuenta-page/centrocuenta-page.component';

@NgModule({
	declarations: [CentrocuentaPageComponent],
	imports: [CommonModule, CentrocuentaRoutingModule]
})
export class CentrocuentaModule {}
