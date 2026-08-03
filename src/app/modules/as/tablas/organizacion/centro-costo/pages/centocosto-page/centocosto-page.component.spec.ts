/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CentocostoPageComponent } from './centocosto-page.component';

describe('CentocostoPageComponent', () => {
	let component: CentocostoPageComponent;
	let fixture: ComponentFixture<CentocostoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CentocostoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CentocostoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
