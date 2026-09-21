import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { HistoricoVisitasRoutingModule } from './historico-visitas-routing.module';
import { HistoricoVisitasPageComponent } from './pages/historico-visitas-page/historico-visitas-page.component';

@NgModule({
	declarations: [HistoricoVisitasPageComponent],
	imports: [CommonModule, HistoricoVisitasRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class HistoricoVisitasModule {}
