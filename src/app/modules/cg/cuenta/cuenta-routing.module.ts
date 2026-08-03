import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuentaPageComponent } from './pages/cuenta-page/cuenta-page.component';

const routes: Routes = [
	{
		path: '',
		component: CuentaPageComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CuentaRoutingModule {}
