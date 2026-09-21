import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { VisitasRoutingModule } from './visitas-routing.module';
import { VisitasPageComponent } from './pages/visitas-page/visitas-page.component';
import { AddVisitaComponent } from './pages/add-visita/add-visita.component';

@NgModule({
	declarations: [VisitasPageComponent, AddVisitaComponent],
	imports: [CommonModule, VisitasRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class VisitasModule {}
