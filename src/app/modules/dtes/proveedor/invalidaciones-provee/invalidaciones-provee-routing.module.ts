import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarInvalidacionesComponent } from './pages/listar-invalidaciones/listar-invalidaciones.component';

const routes: Routes = [
	{
		path: '',
		component: ListarInvalidacionesComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InvalidacionesProveeRoutingModule {}
