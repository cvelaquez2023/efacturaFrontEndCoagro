import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarRetencionesProveeComponent } from './pages/listar-retenciones-provee/listar-retenciones-provee.component';

const routes: Routes = [
	{
		path: '',
		component: ListarRetencionesProveeComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RetencionProveeRoutingModule {}
