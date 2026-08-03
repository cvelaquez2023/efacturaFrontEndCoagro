import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParamModuloPageComponent } from './pages/param-modulo-page/param-modulo-page.component';

const routes: Routes = [
	{
		path: '',
		component: ParamModuloPageComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ParametromoduloRoutingModule {}
