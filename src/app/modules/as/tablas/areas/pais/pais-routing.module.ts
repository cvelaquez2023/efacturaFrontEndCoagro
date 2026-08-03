import { PaisPageComponent } from './pages/pais-page/pais-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: PaisPageComponent }];
console.log('routingPais');
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PaisRoutingModule {}
