import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { GruposArticulosRoutingModule } from './grupos-articulos-routing.module';
import { GruposArticulosPageComponent } from './pages/grupos-articulos-page/grupos-articulos-page.component';
import { AddGrupoArticuloComponent } from './pages/add-grupo-articulo/add-grupo-articulo.component';

@NgModule({
	declarations: [GruposArticulosPageComponent, AddGrupoArticuloComponent],
	imports: [CommonModule, GruposArticulosRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class GruposArticulosModule {}
