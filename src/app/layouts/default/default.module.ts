import { DefaultRoutingModule } from './default-routing-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularMaterialModule } from './../../angular-material-modulo';
import { HomePageComponent } from './../../modules/home/pages/home-page/home-page.component';
import { SharedModule } from './../../shared/shared.module';
import { RouterModule } from '@angular/router';

import { DefaultComponent } from './default.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
	declarations: [DefaultComponent, HomePageComponent],
	imports: [
		CommonModule,
		RouterModule,
		SharedModule,
		MatSidenavModule,
		MatDividerModule,
		AngularMaterialModule,
		FlexLayoutModule,
		DefaultRoutingModule
	]
})
export class DefaultModule {}
