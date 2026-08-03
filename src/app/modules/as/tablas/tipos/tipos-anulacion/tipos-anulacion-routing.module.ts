import { TipoanulacionPageComponent } from './pages/tipoanulacion-page/tipoanulacion-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: TipoanulacionPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TiposAnulacionRoutingModule {}
