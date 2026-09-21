import { AsignacionSugeridosVentaPageComponent } from './pages/asignacion-sugeridos-venta-page/asignacion-sugeridos-venta-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/guards/auth.guard';

const routes: Routes = [
	{
		path: '',
		component: AsignacionSugeridosVentaPageComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AsignacionSugeridosVentaRoutingModule {}
