import { PeriodoContablePageComponent } from './pages/periodo-contable-page/periodo-contable-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: PeriodoContablePageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PeriodosContableRoutingModule {}
