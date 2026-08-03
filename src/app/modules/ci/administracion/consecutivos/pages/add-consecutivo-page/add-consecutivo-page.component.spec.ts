/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddConsecutivoPageComponent } from './add-consecutivo-page.component';

describe('AddConsecutivoPageComponent', () => {
	let component: AddConsecutivoPageComponent;
	let fixture: ComponentFixture<AddConsecutivoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AddConsecutivoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AddConsecutivoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
