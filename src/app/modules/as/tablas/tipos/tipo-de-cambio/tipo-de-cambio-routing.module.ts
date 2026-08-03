import { TipocambioPageComponent } from './pages/tipocambio-page/tipocambio-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: TipocambioPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TipoDeCambioRoutingModule {}
