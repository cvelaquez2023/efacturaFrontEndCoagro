import { ParametrosModuloPageComponent } from './page/parametros-modulo-page/parametros-modulo-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: ParametrosModuloPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ParametrosModuloRoutingModule {}
