/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConsecutivosGlobalesPageComponent } from './consecutivosGlobales-page.component';

describe('ConsecutivosGlobalesPageComponent', () => {
	let component: ConsecutivosGlobalesPageComponent;
	let fixture: ComponentFixture<ConsecutivosGlobalesPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ConsecutivosGlobalesPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConsecutivosGlobalesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
