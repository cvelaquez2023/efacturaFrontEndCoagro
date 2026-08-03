import { EncargadobodegaPageComponent } from './pages/encargadobodega-page/encargadobodega-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: EncargadobodegaPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EncargadoBodegaRoutingModule {}
