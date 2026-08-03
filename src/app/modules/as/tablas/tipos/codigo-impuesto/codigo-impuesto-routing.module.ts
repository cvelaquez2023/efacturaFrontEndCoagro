import { CodImpuestoPageComponent } from './pages/cod-impuesto-page/cod-impuesto-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: CodImpuestoPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CodigoImpuestoRoutingModule {}
