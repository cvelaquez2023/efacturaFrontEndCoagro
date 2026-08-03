/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConsecutivoncfPageComponent } from './consecutivoncf-page.component';

describe('ConsecutivoncfPageComponent', () => {
	let component: ConsecutivoncfPageComponent;
	let fixture: ComponentFixture<ConsecutivoncfPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ConsecutivoncfPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ConsecutivoncfPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
