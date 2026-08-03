/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddPaqueteUsuarioPageComponent } from './add-paqueteUsuario-page.component';

describe('AddPaqueteUsuarioPageComponent', () => {
	let component: AddPaqueteUsuarioPageComponent;
	let fixture: ComponentFixture<AddPaqueteUsuarioPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddPaqueteUsuarioPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddPaqueteUsuarioPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
