import { PATHS_CI_PAGES } from './config/path-page-ci';
import { PATHS_AUTH_PAGES, PATH_AS_PAGES } from './config/path-pages';
import { DefaultComponent } from './layouts/default/default.component';

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { HomePageComponent } from './modules/home/pages/home-page/home-page.component';
import { PATHS_CG_PAGES } from './config/path-page-cg';
import { PATHS_DTE_PAGES } from './config/path-page.dte';
import { PATHS_PROVEE_PAGES } from './config/path-page-prove';

const routes: Routes = [
	{
		path: '',
		canActivate: [AuthGuard],
		component: DefaultComponent,
		children: [
			{
				path: '',
				component: HomePageComponent
			},
			{
				path: PATHS_CI_PAGES.moduloCI.onLyPath,
				loadChildren: () => import('./modules/ci/ci.module').then((m) => m.CiModule)
			},
			{
				path: PATH_AS_PAGES.onlyPath,
				loadChildren: () => import('./modules/as/as.module').then((m) => m.AsModule)
			},
			{
				path: PATHS_CG_PAGES.moduloCG.onLyPath,
				loadChildren: () => import('./modules/cg/cg.module').then((m) => m.CgModule)
			},
			{
				path: PATHS_DTE_PAGES.moduloDte.onLyPath,
				loadChildren: () => import('./modules/dtes/dtes.module').then((m) => m.DtesModule)
			},
			{
				path: PATHS_PROVEE_PAGES.moduloprovee.onLyPath,
				loadChildren: () => import('./modules/dtes/proveedor/proveedor.module').then((m) => m.ProveedorModule)
			}
		]
	},

	{
		path: PATHS_AUTH_PAGES.LoginPage.onLyPath,
		loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
