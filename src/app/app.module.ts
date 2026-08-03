/* eslint-disable prettier/prettier */
import { loteEffects } from './modules/ci/lote/store/lote.effects';
import { existenciaBodegaEffect } from './modules/as/tablas/otros/bodega/store/existenciaBodega/existenciaBodega.effects';
import { condicionPagoEffects } from './modules/as/tablas/tipos/condcion-pago/store/condiconPago.effects';
import { articuloEffects } from './modules/ci/articulo/store/articulo.effects';
import { localizacionEffect } from './modules/as/tablas/otros/bodega/store/localizaciones/loc.effects';
import { bodegaEffect } from './modules/as/tablas/otros/bodega/store/bodega.effects';
import { globalesCiEffects } from './modules/ci/store/ci.effects';
import { globalesASEffects } from './modules/as/strore/as.effects';
import { ROOT_REDUCERS } from './config/app.state';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DefaultModule } from './layouts/default/default.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './angular-material-modulo';

import { AuthModule } from './modules/auth/auth.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './interceptors/api.interceptor';
import { ErrorApiInterceptor } from './interceptors/error-api.interceptor';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { SnotifyModule, ToastDefaults, SnotifyService } from 'ng-snotify';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
	declarations: [AppComponent],
	imports: [
		FlexLayoutModule,
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		DefaultModule,
		AngularMaterialModule,
		FormsModule,
		ReactiveFormsModule,
		AuthModule,
		HttpClientModule,
		NgxUiLoaderModule,
		SnotifyModule,
		MatFormFieldModule,
		CurrencyMaskModule,
		StoreModule.forRoot(ROOT_REDUCERS),
		EffectsModule.forRoot([
			globalesASEffects,
			globalesCiEffects,
			bodegaEffect,
			localizacionEffect,
			articuloEffects,
			condicionPagoEffects,
			existenciaBodegaEffect,
			loteEffects
		]),
		StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
	],

	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
		{ provide: 'SnotifyToastConfig', useValue: ToastDefaults },
		SnotifyService,
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorApiInterceptor, multi: true },
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
