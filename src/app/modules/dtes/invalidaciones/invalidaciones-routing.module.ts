import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarInvalidacionesPagesComponent } from './pages/listar-invalidaciones-pages/listar-invalidaciones-pages.component';

const routes: Routes = [
	{
		path: '',
		component: ListarInvalidacionesPagesComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InvalidacionesRoutingModule {}
