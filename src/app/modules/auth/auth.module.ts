import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './../../angular-material-modulo';
import { RegisterPageComponent } from './pages/register-page/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page/login-page.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { HeaderComponent } from './componetes/header/header/header.component';

@NgModule({
	declarations: [HeaderComponent, LoginPageComponent, RegisterPageComponent],
	imports: [CommonModule, AuthRoutingModule, AngularMaterialModule, ReactiveFormsModule, FlexLayoutModule]
})
export class AuthModule {}
