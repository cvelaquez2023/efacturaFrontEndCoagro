import { RetencionesPageComponent } from './pages/retenciones-page/retenciones-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: RetencionesPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RetencionesRoutingModule {}
