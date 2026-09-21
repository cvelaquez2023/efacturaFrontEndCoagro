import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '@app/angular-material-modulo';

import { DashboardGeneralRoutingModule } from './dashboard-general-routing.module';
import { DashboardGeneralPageComponent } from './pages/dashboard-general-page/dashboard-general-page.component';

@NgModule({
	declarations: [DashboardGeneralPageComponent],
	imports: [CommonModule, DashboardGeneralRoutingModule, FormsModule, ReactiveFormsModule, AngularMaterialModule]
})
export class DashboardGeneralModule {}
