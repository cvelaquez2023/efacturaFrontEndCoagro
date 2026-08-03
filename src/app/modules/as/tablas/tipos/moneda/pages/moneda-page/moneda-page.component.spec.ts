/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MonedaPageComponent } from './moneda-page.component';

describe('MonedaPageComponent', () => {
	let component: MonedaPageComponent;
	let fixture: ComponentFixture<MonedaPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MonedaPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MonedaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
