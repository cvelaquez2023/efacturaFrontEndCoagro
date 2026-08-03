import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NivelPrecioPageComponent } from './pages/nivel-precio-page/nivel-precio-page.component';

const routes: Routes = [{ path: '', component: NivelPrecioPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class NivelprecioRoutingModule {}
