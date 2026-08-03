/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LotePageComponent } from './lote-page.component';

describe('LotePageComponent', () => {
	let component: LotePageComponent;
	let fixture: ComponentFixture<LotePageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LotePageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LotePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
