/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ModeloretencionPageComponent } from './modeloretencion-page.component';

describe('ModeloretencionPageComponent', () => {
	let component: ModeloretencionPageComponent;
	let fixture: ComponentFixture<ModeloretencionPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ModeloretencionPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ModeloretencionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
