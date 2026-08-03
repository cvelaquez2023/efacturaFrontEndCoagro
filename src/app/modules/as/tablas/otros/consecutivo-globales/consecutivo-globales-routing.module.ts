import { ConsecutivosGlobalesPageComponent } from './pages/consecutivosGlobales-page/consecutivosGlobales-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: ConsecutivosGlobalesPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ConsecutivoGlobalesRoutingModule {}
