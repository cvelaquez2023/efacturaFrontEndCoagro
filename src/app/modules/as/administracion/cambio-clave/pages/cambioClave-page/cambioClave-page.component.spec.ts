/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CambioClavePageComponent } from './cambioClave-page.component';

describe('CambioClavePageComponent', () => {
	let component: CambioClavePageComponent;
	let fixture: ComponentFixture<CambioClavePageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CambioClavePageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CambioClavePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
