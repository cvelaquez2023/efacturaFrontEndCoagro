import { PATHS_CI_PAGES } from '@app/config/path-page-ci';
import { ControlInventarioPageComponent } from './pages/control-inventario-page/control-inventario-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';
const routes: Routes = [
	{
		path: '',
		component: ControlInventarioPageComponent,
		canActivate: [AuthGuard]
	},
	{
		path: PATHS_CI_PAGES.articulo.onLypath,
		loadChildren: () => import('../ci/articulo/articulo.module').then((m) => m.ArticuloModule)
	},
	{
		path: PATHS_CI_PAGES.lote.onLypath,
		loadChildren: () => import('../ci/lote/lote.module').then((m) => m.LoteModule)
	},
	{
		path: PATHS_CI_PAGES.paqueteCI.onLypath,
		loadChildren: () => import('../ci/transacciones/paquete/paquete.module').then((m) => m.PaqueteModule)
	},
	{
		path: PATHS_CI_PAGES.enLinea.onLypath,
		loadChildren: () => import('../ci/transacciones/enlinea/enlinea.module').then((m) => m.EnlineaModule)
	},
	//Administracion

	{
		path: PATHS_CI_PAGES.consecutivoCI.onLypath,
		loadChildren: () =>
			import('../ci/administracion/consecutivos/consecutivos.module').then((m) => m.ConsecutivosModule)
	},
	{
		path: PATHS_CI_PAGES.clasificaciones.onLypath,
		loadChildren: () =>
			import('../ci/administracion/clasificaciones/clasificaciones.module').then((m) => m.ClasificacionesModule)
	},
	{
		path: PATHS_CI_PAGES.transaccionesConfigurables.onLypath,
		loadChildren: () =>
			import('../ci/administracion/transacciones-configurables/transacciones-configurables.module').then(
				(m) => m.TransaccionesConfigurablesModule
			)
	},
	{
		path: PATHS_CI_PAGES.parametrosModulo.onLyPath,
		loadChildren: () =>
			import('../ci/administracion/parametros-modulo/parametros-modulo.module').then((m) => m.ParametrosModuloModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CiRoutingModule {}
