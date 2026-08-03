import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaProveedorDteComponent } from './pages/lista-proveedor-dte/lista-proveedor-dte.component';
import { AuthGuard } from '@app/guards/auth.guard';
import { PATHS_PROVEE_PAGES } from '@app/config/path-page-prove';

const routes: Routes = [
	{
		path: '',
		component: ListaProveedorDteComponent,
		canActivate: [AuthGuard]
	},
	{
		path: PATHS_PROVEE_PAGES.listadte.onLyPath,
		loadChildren: () => import('../proveedor/proveedor.module').then((m) => m.ProveedorModule)
	},
	{
		path: PATHS_PROVEE_PAGES.retenciones.onLyPath,
		loadChildren: () => import('../proveedor/proveedor.module').then((m) => m.ProveedorModule)
	},
	{
		path: PATHS_PROVEE_PAGES.sujetoexcluido.onLypath,
		loadChildren: () =>
			import('../proveedor/sujetoexcluido-provee/sujetoexcluido-provee.module').then(
				(m) => m.SujetoexcluidoProveeModule
			)
	},
	{
		path: PATHS_PROVEE_PAGES.invalidacion.onLypath,
		loadChildren: () =>
			import('../proveedor/invalidaciones-provee/invalidaciones-provee.module').then(
				(m) => m.InvalidacionesProveeModule
			)
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProveedorRoutingModule {}
