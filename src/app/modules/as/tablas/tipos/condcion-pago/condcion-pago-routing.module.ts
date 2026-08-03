import { CondicionpagoPageComponent } from './pages/condicionpago-page/condicionpago-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: CondicionpagoPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CondcionPagoRoutingModule {}
