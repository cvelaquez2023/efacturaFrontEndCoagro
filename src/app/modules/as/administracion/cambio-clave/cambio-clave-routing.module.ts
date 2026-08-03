import { CambioClavePageComponent } from './pages/cambioClave-page/cambioClave-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: CambioClavePageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CambioClaveRoutingModule {}
