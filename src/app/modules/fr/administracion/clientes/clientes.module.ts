import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { ClientesRoutingModule } from './clientes-routing.module';
import { ClientesPageComponent } from './pages/clientes-page/clientes-page.component';
import { AddClienteFrComponent } from './pages/add-cliente-fr/add-cliente-fr.component';

@NgModule({
	declarations: [ClientesPageComponent, AddClienteFrComponent],
	imports: [CommonModule, ClientesRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class ClientesModule {}
