import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvalidacionesRoutingModule } from './invalidaciones-routing.module';
import { ListarInvalidacionesPagesComponent } from './pages/listar-invalidaciones-pages/listar-invalidaciones-pages.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { MatSelectModule } from '@angular/material/select';
import { CrearInvalidacionPageComponent } from './pages/crear-invalidacion-page/crear-invalidacion-page.component';

@NgModule({
	declarations: [ListarInvalidacionesPagesComponent, CrearInvalidacionPageComponent],
	imports: [
		CommonModule,
		InvalidacionesRoutingModule,
		FormsModule,
		MatTableModule,
		MatSortModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		MatFormFieldModule,
		MatInputModule,
		CurrencyMaskModule,
		MatSelectModule
	]
})
export class InvalidacionesModule {}
