import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaDtePageComponent } from './pages/lista-dte-page/lista-dte-page.component';
import { AuthGuard } from '@app/guards/auth.guard';
import { PATHS_DTE_PAGES } from '@app/config/path-page.dte';

const routes: Routes = [
	{
		path: '',
		component: ListaDtePageComponent,
		canActivate: [AuthGuard]
	},
	{
		path: PATHS_DTE_PAGES.clienteDte.onLyPath,
		loadChildren: () => import('../dtes/cliente/cliente.module').then((m) => m.ClienteModule)
	},
	{
		path: PATHS_DTE_PAGES.proveedorDte.onLyPath,
		loadChildren: () => import('../dtes/proveedor/proveedor.module').then((m) => m.ProveedorModule)
	},
	{
		path: PATHS_DTE_PAGES.invalidacionDte.onLypath,
		loadChildren: () => import('../dtes/invalidaciones/invalidaciones.module').then((m) => m.InvalidacionesModule)
	},
	{
		path: PATHS_DTE_PAGES.usuarioDte.onLypath,
		loadChildren: () => import('../dtes/usuarios/usuarios.module').then((m) => m.UsuariosModule)
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DtesRoutingModule {}
