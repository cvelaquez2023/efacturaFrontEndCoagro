/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EnlineaPageComponent } from './enlinea-page.component';

describe('EnlineaPageComponent', () => {
	let component: EnlineaPageComponent;
	let fixture: ComponentFixture<EnlineaPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [EnlineaPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(EnlineaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
