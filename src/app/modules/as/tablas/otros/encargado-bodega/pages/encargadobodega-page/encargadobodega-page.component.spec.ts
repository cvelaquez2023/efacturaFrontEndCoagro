/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EncargadobodegaPageComponent } from './encargadobodega-page.component';

describe('EncargadobodegaPageComponent', () => {
	let component: EncargadobodegaPageComponent;
	let fixture: ComponentFixture<EncargadobodegaPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EncargadobodegaPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EncargadobodegaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
