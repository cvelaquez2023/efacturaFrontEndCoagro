import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SujetoexcluidoProveeRoutingModule } from './sujetoexcluido-provee-routing.module';
import { ListarSujetoExcluidoComponent } from './pages/listar-sujeto-excluido/listar-sujeto-excluido.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { AngularMaterialModule } from '@app/angular-material-modulo';
import { MatInputModule } from '@angular/material/input';
import { AddSujetoExcluidoComponent } from './pages/add-sujeto-excluido/add-sujeto-excluido.component';
import { AddSujetoExcluidoCHComponent } from './pages/add-sujeto-excluido-ch/add-sujeto-excluido-ch.component';

@NgModule({
	declarations: [ListarSujetoExcluidoComponent, AddSujetoExcluidoComponent, AddSujetoExcluidoCHComponent],
	imports: [
		CommonModule,
		SujetoexcluidoProveeRoutingModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		AngularMaterialModule,
		ReactiveFormsModule,
		MatInputModule
	]
})
export class SujetoexcluidoProveeModule {}
