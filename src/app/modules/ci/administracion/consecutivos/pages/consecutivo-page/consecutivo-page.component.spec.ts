/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConsecutivoPageComponent } from './consecutivo-page.component';

describe('ConsecutivoPageComponent', () => {
	let component: ConsecutivoPageComponent;
	let fixture: ComponentFixture<ConsecutivoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ConsecutivoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConsecutivoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
