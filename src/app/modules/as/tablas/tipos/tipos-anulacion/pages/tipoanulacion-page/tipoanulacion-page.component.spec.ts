/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TipoanulacionPageComponent } from './tipoanulacion-page.component';

describe('TipoanulacionPageComponent', () => {
	let component: TipoanulacionPageComponent;
	let fixture: ComponentFixture<TipoanulacionPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TipoanulacionPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TipoanulacionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
