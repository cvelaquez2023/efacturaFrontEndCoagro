import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriaarticuloPageComponent } from './pages/categoriaarticulo-page/categoriaarticulo-page.component';

const routes: Routes = [{ path: '', component: CategoriaarticuloPageComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CategoriaarticuloRoutingModule {}
