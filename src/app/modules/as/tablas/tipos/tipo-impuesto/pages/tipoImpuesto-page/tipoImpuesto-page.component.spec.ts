/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TipoImpuestoPageComponent } from './tipoImpuesto-page.component';

describe('TipoImpuestoPageComponent', () => {
	let component: TipoImpuestoPageComponent;
	let fixture: ComponentFixture<TipoImpuestoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TipoImpuestoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TipoImpuestoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
