import { CargaUbicacionesClientesPageComponent } from './pages/carga-ubicaciones-clientes-page/carga-ubicaciones-clientes-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: CargaUbicacionesClientesPageComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CargaUbicacionesClientesRoutingModule {}
