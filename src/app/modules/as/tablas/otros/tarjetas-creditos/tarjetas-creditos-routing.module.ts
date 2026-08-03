import { TarjetaCreditoPageComponent } from './pages/tarjetaCredito-page/tarjetaCredito-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: '', component: TarjetaCreditoPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class TarjetasCreditosRoutingModule {}
