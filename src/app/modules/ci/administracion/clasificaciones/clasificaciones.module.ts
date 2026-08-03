import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './../../../../angular-material-modulo';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClasificacionesRoutingModule } from './clasificaciones-routing.module';
import { ClasificacionesPageComponent } from './pages/clasificaciones-page/clasificaciones-page.component';
import { AddClasificacionesPageComponent } from './pages/add-clasificaciones-page/add-clasificaciones-page.component';

@NgModule({
	declarations: [ClasificacionesPageComponent, AddClasificacionesPageComponent],
	imports: [CommonModule, ClasificacionesRoutingModule, AngularMaterialModule, FormsModule, ReactiveFormsModule]
})
export class ClasificacionesModule {}
