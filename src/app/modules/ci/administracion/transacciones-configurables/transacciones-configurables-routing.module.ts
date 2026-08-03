import { TransConfigurablePageComponent } from './pages/transConfigurable-page/transConfigurable-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: TransConfigurablePageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TransaccionesConfigurablesRoutingModule {}
