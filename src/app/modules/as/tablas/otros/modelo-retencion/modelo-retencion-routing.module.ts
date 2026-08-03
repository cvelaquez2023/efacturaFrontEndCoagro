import { ModeloretencionPageComponent } from './pages/modeloretencion-page/modeloretencion-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: ModeloretencionPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ModeloRetencionRoutingModule {}
