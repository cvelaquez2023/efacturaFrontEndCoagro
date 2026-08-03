import { UnidaMedidaPageComponent } from './pages/unida-medida-page/unida-medida-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: UnidaMedidaPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UnidadMedidaRoutingModule {}
