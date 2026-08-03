import { ObjToArrayPipe } from './pipe/objToArray.pipe';
import { AddTransconfigurablePageComponent } from './pages/add-transconfigurable-page/add-transconfigurable-page.component';
import { TransConfigurablePageComponent } from './pages/transConfigurable-page/transConfigurable-page.component';
import { AngularMaterialModule } from './../../../../angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransaccionesConfigurablesRoutingModule } from './transacciones-configurables-routing.module';

@NgModule({
	declarations: [TransConfigurablePageComponent, AddTransconfigurablePageComponent, ObjToArrayPipe],
	imports: [
		CommonModule,
		TransaccionesConfigurablesRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class TransaccionesConfigurablesModule {}
