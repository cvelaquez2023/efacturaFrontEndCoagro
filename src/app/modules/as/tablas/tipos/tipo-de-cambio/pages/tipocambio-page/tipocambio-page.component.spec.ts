/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TipocambioPageComponent } from './tipocambio-page.component';

describe('TipocambioPageComponent', () => {
	let component: TipocambioPageComponent;
	let fixture: ComponentFixture<TipocambioPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TipocambioPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TipocambioPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
