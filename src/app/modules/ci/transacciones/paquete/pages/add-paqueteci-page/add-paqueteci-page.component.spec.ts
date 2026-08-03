/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddPaqueteciPageComponent } from './add-paqueteci-page.component';

describe('AddPaqueteciPageComponent', () => {
	let component: AddPaqueteciPageComponent;
	let fixture: ComponentFixture<AddPaqueteciPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddPaqueteciPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddPaqueteciPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
