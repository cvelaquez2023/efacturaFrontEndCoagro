import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuentaRoutingModule } from './cuenta-routing.module';
import { CuentaPageComponent } from './pages/cuenta-page/cuenta-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { AddCuentaComponent } from './pages/add-cuenta/add-cuenta.component';
import { CuentaTipoPipe } from './pipe/cuenta-tipo.pipe';
import { TipoDetalladoPipe } from './pipe/tipo-detallado.pipe';

@NgModule({
	declarations: [CuentaPageComponent, AddCuentaComponent, CuentaTipoPipe, TipoDetalladoPipe],
	imports: [
		CommonModule,
		CuentaRoutingModule,
		MatTableModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class CuentaModule {}
