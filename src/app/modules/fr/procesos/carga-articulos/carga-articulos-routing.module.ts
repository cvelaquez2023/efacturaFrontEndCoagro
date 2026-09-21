import { CargaArticulosPageComponent } from './pages/carga-articulos-page/carga-articulos-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: CargaArticulosPageComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CargaArticulosRoutingModule {}
