/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TarjetaCreditoPageComponent } from './tarjetaCredito-page.component';

describe('TarjetaCreditoPageComponent', () => {
	let component: TarjetaCreditoPageComponent;
	let fixture: ComponentFixture<TarjetaCreditoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TarjetaCreditoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TarjetaCreditoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
