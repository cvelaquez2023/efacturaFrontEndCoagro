import { PATH_AS_PAGES } from './../../config/path-pages';
import { AsPageComponent } from './pages/as-page/as-page/as-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: AsPageComponent,
		canActivate: [AuthGuard]
	},
	//Seguridad
	{
		path: PATH_AS_PAGES.documento.onlyPath,
		loadChildren: () => import('../as/seguridad/usuario/usuario.module').then((m) => m.UsuarioModule)
	},
	{
		path: PATH_AS_PAGES.crearInvalidacion.onlyPath,
		loadChildren: () => import('../as/seguridad/grupo/grupo.module').then((m) => m.GrupoModule)
	},
	//Tablas/Areas
	{
		path: PATH_AS_PAGES.listarInvalidacion.onlyPath,
		loadChildren: () => import('../as/tablas/areas/pais/pais.module').then((m) => m.PaisModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AsRoutingModule {}
