import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TiposAnulacionRoutingModule } from './tipos-anulacion-routing.module';
import { AddTipoAnulacionComponent } from './pages/add-tipo-anulacion/add-tipo-anulacion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { TipoanulacionPageComponent } from './pages/tipoanulacion-page/tipoanulacion-page.component';

@NgModule({
	declarations: [TipoanulacionPageComponent, AddTipoAnulacionComponent],
	imports: [
		CommonModule,
		TiposAnulacionRoutingModule,
		FormsModule,
		MatTabsModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class TiposAnulacionModule {}
