import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaClienteDteComponent } from './pages/lista-cliente-dte/lista-cliente-dte.component';

const routes: Routes = [
	{
		path: '',
		component: ListaClienteDteComponent
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ClienteRoutingModule {}
