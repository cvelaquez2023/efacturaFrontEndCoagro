import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParametromoduloRoutingModule } from './parametromodulo-routing.module';
import { ParamModuloPageComponent } from './pages/param-modulo-page/param-modulo-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	declarations: [ParamModuloPageComponent],
	imports: [
		CommonModule,
		ParametromoduloRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		FlexLayoutModule
	]
})
export class ParametromoduloModule {}
