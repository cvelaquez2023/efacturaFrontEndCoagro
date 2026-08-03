/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TransConfigurablePageComponent } from './transConfigurable-page.component';

describe('TransConfigurablePageComponent', () => {
	let component: TransConfigurablePageComponent;
	let fixture: ComponentFixture<TransConfigurablePageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TransConfigurablePageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TransConfigurablePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
