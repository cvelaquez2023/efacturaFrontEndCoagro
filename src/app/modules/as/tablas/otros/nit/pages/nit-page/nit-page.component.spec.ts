/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NitPageComponent } from './nit-page.component';

describe('NitPageComponent', () => {
	let component: NitPageComponent;
	let fixture: ComponentFixture<NitPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [NitPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NitPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
