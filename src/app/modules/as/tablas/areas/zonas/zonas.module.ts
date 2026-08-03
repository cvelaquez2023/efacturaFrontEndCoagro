import { AngularMaterialModule } from './../../../../../angular-material-modulo';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZonasRoutingModule } from './zonas-routing.module';
import { ZonaPageComponent } from './pages/zona-page/zona-page.component';
import { AddComponent } from './pages/add/add.component';

@NgModule({
	declarations: [ZonaPageComponent, AddComponent],
	imports: [
		CommonModule,
		ZonasRoutingModule,
		MatTableModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		AngularMaterialModule
	]
})
export class ZonasModule {}
