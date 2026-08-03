/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UsuariosConsecutivosPageComponent } from './usuariosConsecutivos-page.component';

describe('UsuariosConsecutivosPageComponent', () => {
	let component: UsuariosConsecutivosPageComponent;
	let fixture: ComponentFixture<UsuariosConsecutivosPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UsuariosConsecutivosPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UsuariosConsecutivosPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
