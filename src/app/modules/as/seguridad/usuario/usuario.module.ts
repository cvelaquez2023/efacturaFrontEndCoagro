import { AngularMaterialModule } from '@app/angular-material-modulo';
import { UsuarioPageComponent } from './pages/usuario-page/usuario-page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuarioRoutingModule } from './usuario-routing.module';
import { AddComponent } from './pages/add/add.component';
import { PrivilegiosComponent } from './pages/privilegios/privilegios.component';

@NgModule({
	declarations: [AddComponent, UsuarioPageComponent, PrivilegiosComponent],
	imports: [
		CommonModule,
		UsuarioRoutingModule,
		AngularMaterialModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule
	]
})
export class UsuarioModule {}
