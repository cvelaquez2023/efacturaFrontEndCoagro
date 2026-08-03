import { ConsecutivoncfPageComponent } from './pages/consecutivoncf-page/consecutivoncf-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: ConsecutivoncfPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ConsecutivoNCFRoutingModule {}
