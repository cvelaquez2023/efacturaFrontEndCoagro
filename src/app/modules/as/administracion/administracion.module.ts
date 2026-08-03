import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './../../../angular-material-modulo';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdministracionRoutingModule } from './administracion-routing.module';
import { ParametrosPageComponent } from './pages/parametros-page/parametros-page.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
	declarations: [ParametrosPageComponent],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		AdministracionRoutingModule,
		FormsModule,
		CommonModule,
		FlexLayoutModule,
		AngularMaterialModule,
		MatTabsModule
	]
})
export class AdministracionModule {}
