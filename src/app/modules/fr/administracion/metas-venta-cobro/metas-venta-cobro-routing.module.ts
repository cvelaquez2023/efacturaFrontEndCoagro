import { MetasVentaCobroPageComponent } from './pages/metas-venta-cobro-page/metas-venta-cobro-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: MetasVentaCobroPageComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MetasVentaCobroRoutingModule {}
