import { UbicacionPageComponent } from './pages/ubicacion-page/ubicacion-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: UbicacionPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class UbicacionRoutingModule {}
