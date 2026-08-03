import { AngularMaterialModule } from '@app/angular-material-modulo';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsuariosRoutingModule } from './usuarios-routing.module';
import { ListarPagesComponent } from './pages/listar-pages/listar-pages.component';
import { ListaUsuariosPagesComponent } from './pages/lista-usuarios-pages/lista-usuarios-pages.component';
import { CrearUsuarioComponent } from './pages/crear-usuario/crear-usuario.component';
import { EditarUsuarioComponent } from './pages/editar-usuario/editar-usuario.component';

@NgModule({
	declarations: [ListarPagesComponent, ListaUsuariosPagesComponent, CrearUsuarioComponent, EditarUsuarioComponent],
	imports: [
		FormsModule,
		MatTableModule,
		MatIconModule,
		ReactiveFormsModule,
		AngularMaterialModule,
		CommonModule,
		UsuariosRoutingModule
	]
})
export class UsuariosModule {}
