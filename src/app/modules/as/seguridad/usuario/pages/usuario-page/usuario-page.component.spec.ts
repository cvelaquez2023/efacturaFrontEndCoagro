/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UsuarioPageComponent } from './usuario-page.component';

describe('UsuarioPageComponent', () => {
	let component: UsuarioPageComponent;
	let fixture: ComponentFixture<UsuarioPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UsuarioPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UsuarioPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
