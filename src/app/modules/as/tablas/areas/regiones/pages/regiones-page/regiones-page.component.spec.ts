/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RegionesPageComponent } from './regiones-page.component';

describe('RegionesPageComponent', () => {
	let component: RegionesPageComponent;
	let fixture: ComponentFixture<RegionesPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RegionesPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RegionesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
