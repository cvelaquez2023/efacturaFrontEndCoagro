import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContaGeneralPageComponent } from './pages/conta-general-page/conta-general-page.component';
import { AuthGuard } from '@app/guards/auth.guard';

import { PATHS_CG_PAGES } from '@app/config/path-page-cg';

const routes: Routes = [
	{
		//Inicio
		path: '',
		component: ContaGeneralPageComponent,
		canActivate: [AuthGuard]
	},
	//Cuentas
	{
		path: PATHS_CG_PAGES.cuentaContable.onLyPath,
		loadChildren: () => import('../cg/cuenta/cuenta.module').then((m) => m.CuentaModule)
	},
	//Transacciones
	//Consultas
	//Reportes
	//Procesos
	//Admisitracion
	{
		path: PATHS_CG_PAGES.parametrosModulo.onLyPath,
		loadChildren: () =>
			import('../cg/administracion/parametromodulo/parametromodulo.module').then((m) => m.ParametromoduloModule)
	},
	{
		path: PATHS_CG_PAGES.centroCuenta.onLyPath,
		loadChildren: () =>
			import('../cg/administracion/centrocuenta/centrocuenta.module').then((m) => m.CentrocuentaModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CgRoutingModule {}
