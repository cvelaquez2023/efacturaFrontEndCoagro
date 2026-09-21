import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { CargaHandheldRoutingModule } from './carga-handheld-routing.module';
import { CargaHandheldPageComponent } from './pages/carga-handheld-page/carga-handheld-page.component';

@NgModule({
	declarations: [CargaHandheldPageComponent],
	imports: [CommonModule, CargaHandheldRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class CargaHandheldModule {}
