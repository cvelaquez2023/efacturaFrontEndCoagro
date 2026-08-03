/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RetencionesPageComponent } from './retenciones-page.component';

describe('RetencionesPageComponent', () => {
	let component: RetencionesPageComponent;
	let fixture: ComponentFixture<RetencionesPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RetencionesPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RetencionesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
