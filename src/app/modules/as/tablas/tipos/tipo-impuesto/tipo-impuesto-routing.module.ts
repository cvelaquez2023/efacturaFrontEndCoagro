import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoImpuestoPageComponent } from './pages/tipoImpuesto-page/tipoImpuesto-page.component';

const routes: Routes = [{ path: '', component: TipoImpuestoPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TipoImpuestoRoutingModule {}
