import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarSujetoExcluidoComponent } from './pages/listar-sujeto-excluido/listar-sujeto-excluido.component';

const routes: Routes = [
	{
		path: '',
		component: ListarSujetoExcluidoComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SujetoexcluidoProveeRoutingModule {}
