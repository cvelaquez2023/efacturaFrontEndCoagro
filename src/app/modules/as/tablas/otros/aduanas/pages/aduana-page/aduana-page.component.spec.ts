/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AduanaPageComponent } from './aduana-page.component';

describe('AduanaPageComponent', () => {
	let component: AduanaPageComponent;
	let fixture: ComponentFixture<AduanaPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AduanaPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AduanaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
