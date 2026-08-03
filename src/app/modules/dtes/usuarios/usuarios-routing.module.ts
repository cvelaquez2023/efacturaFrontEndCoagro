import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaUsuariosPagesComponent } from './pages/lista-usuarios-pages/lista-usuarios-pages.component';

const routes: Routes = [
	{
		path: '',
		component: ListaUsuariosPagesComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UsuariosRoutingModule {}
