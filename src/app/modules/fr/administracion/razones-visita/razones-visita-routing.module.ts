import { RazonesVisitaPageComponent } from './pages/razones-visita-page/razones-visita-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: RazonesVisitaPageComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RazonesVisitaRoutingModule {}
