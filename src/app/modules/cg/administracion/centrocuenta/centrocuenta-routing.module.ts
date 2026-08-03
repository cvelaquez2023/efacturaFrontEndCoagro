import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentrocuentaPageComponent } from './pages/centrocuenta-page/centrocuenta-page.component';

const routes: Routes = [
	{
		path: '',
		component: CentrocuentaPageComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CentrocuentaRoutingModule {}
