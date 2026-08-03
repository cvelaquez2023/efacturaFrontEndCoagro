import { RegisterPageComponent } from './pages/register-page/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page/login-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{ path: '', component: LoginPageComponent },
	{ path: 'register', component: RegisterPageComponent }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthRoutingModule {}
