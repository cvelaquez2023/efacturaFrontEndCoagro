import { PaqueteciPageComponent } from './pages/paqueteci-page/paqueteci-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: PaqueteciPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PaqueteRoutingModule {}
