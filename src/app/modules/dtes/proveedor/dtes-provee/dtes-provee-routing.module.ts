import { ListarDteProveeComponent } from './pages/listar-dte-provee/listar-dte-provee.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: ListarDteProveeComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DtesProveeRoutingModule {}
