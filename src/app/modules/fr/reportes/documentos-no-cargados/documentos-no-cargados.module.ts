import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { DocumentosNoCargadosRoutingModule } from './documentos-no-cargados-routing.module';
import { DocumentosNoCargadosPageComponent } from './pages/documentos-no-cargados-page/documentos-no-cargados-page.component';

@NgModule({
	declarations: [DocumentosNoCargadosPageComponent],
	imports: [CommonModule, DocumentosNoCargadosRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class DocumentosNoCargadosModule {}
