import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { DocumentosGeneradosFrRoutingModule } from './documentos-generados-fr-routing.module';
import { DocumentosGeneradosFrPageComponent } from './pages/documentos-generados-fr-page/documentos-generados-fr-page.component';

@NgModule({
	declarations: [DocumentosGeneradosFrPageComponent],
	imports: [CommonModule, DocumentosGeneradosFrRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class DocumentosGeneradosFrModule {}
