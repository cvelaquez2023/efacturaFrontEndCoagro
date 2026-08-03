/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AtributosPageComponent } from './atributos-page.component';

describe('AtributosPageComponent', () => {
	let component: AtributosPageComponent;
	let fixture: ComponentFixture<AtributosPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AtributosPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AtributosPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
