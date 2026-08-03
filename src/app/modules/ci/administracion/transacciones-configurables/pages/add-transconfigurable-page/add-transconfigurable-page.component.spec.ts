/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddTransconfigurablePageComponent } from './add-transconfigurable-page.component';

describe('AddTransconfigurablePageComponent', () => {
	let component: AddTransconfigurablePageComponent;
	let fixture: ComponentFixture<AddTransconfigurablePageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddTransconfigurablePageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddTransconfigurablePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
