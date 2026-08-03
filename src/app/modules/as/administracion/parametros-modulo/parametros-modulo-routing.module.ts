import { ParametrosModulosASPageComponent } from './pages/parametrosModulosAS-page/parametrosModulosAS-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: ParametrosModulosASPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ParametrosModuloRoutingModule {}
