import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaContigenciarPagesComponent } from './pages/lista-contigenciar-pages/lista-contigenciar-pages.component';

const routes: Routes = [
	{
		path: '',
		component: ListaContigenciarPagesComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ContingenciaRoutingModule {}
