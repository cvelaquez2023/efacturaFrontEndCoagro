import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClienteRoutingModule } from './cliente-routing.module';
import { ListaClienteDteComponent } from './pages/lista-cliente-dte/lista-cliente-dte.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { ListaObservacionesComponent } from './pages/lista-observaciones/lista-observaciones.component';
import { EnvioEmailComponent } from './pages/envio-email/envio-email.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
	declarations: [ListaClienteDteComponent, ListaObservacionesComponent, EnvioEmailComponent],
	imports: [
		CommonModule,
		ClienteRoutingModule,
		FormsModule,
		MatTableModule,
		MatSortModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		MatFormFieldModule,
		MatInputModule,
		CurrencyMaskModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule
	]
})
export class ClienteModule {}
