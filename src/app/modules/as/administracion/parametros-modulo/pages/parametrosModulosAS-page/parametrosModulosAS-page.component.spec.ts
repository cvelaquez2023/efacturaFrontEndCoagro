/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ParametrosModulosASPageComponent } from './parametrosModulosAS-page.component';

describe('ParametrosModulosASPageComponent', () => {
	let component: ParametrosModulosASPageComponent;
	let fixture: ComponentFixture<ParametrosModulosASPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ParametrosModulosASPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ParametrosModulosASPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
