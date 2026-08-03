import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CgRoutingModule } from './cg-routing.module';
import { ContaGeneralPageComponent } from './pages/conta-general-page/conta-general-page.component';

@NgModule({
	declarations: [ContaGeneralPageComponent],
	imports: [CommonModule, CgRoutingModule]
})
export class CgModule {}
