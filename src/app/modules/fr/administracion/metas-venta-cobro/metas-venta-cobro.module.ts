import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { MetasVentaCobroRoutingModule } from './metas-venta-cobro-routing.module';
import { MetasVentaCobroPageComponent } from './pages/metas-venta-cobro-page/metas-venta-cobro-page.component';

@NgModule({
	declarations: [MetasVentaCobroPageComponent],
	imports: [CommonModule, MetasVentaCobroRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule, MatProgressBarModule]
})
export class MetasVentaCobroModule {}
