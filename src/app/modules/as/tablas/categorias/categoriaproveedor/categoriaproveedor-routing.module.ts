import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriaproveedorPageComponent } from './pages/categoriaproveedor-page/categoriaproveedor-page.component';

const routes: Routes = [{ path: '', component: CategoriaproveedorPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CategoriaproveedorRoutingModule {}
