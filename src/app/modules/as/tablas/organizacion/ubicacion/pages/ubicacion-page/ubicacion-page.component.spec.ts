/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UbicacionPageComponent } from './ubicacion-page.component';

describe('UbicacionPageComponent', () => {
	let component: UbicacionPageComponent;
	let fixture: ComponentFixture<UbicacionPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UbicacionPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UbicacionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
