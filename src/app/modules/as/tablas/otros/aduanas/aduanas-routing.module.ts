import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AduanaPageComponent } from './pages/aduana-page/aduana-page.component';

const routes: Routes = [{ path: '', component: AduanaPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AduanasRoutingModule {}
