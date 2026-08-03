import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CentroCostoRoutingModule } from './centro-costo-routing.module';
import { CentocostoPageComponent } from './pages/centocosto-page/centocosto-page.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { AddComponent } from './pages/add/add.component';
import { TipoCentroCostoPipe } from './pipe/tipo-centro-costo.pipe';

@NgModule({
	declarations: [CentocostoPageComponent, AddComponent, TipoCentroCostoPipe],
	imports: [
		FormsModule,
		MatTabsModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		CentroCostoRoutingModule
	]
})
export class CentroCostoModule {}
