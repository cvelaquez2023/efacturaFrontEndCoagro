import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { EmmRoutingModule } from './emm-routing.module';
import { EmmPageComponent } from './pages/emm-page/emm-page.component';

@NgModule({
	declarations: [EmmPageComponent],
	imports: [CommonModule, EmmRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class EmmModule {}
