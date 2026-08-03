/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GrupoPageComponent } from './grupo-page.component';

describe('GrupoPageComponent', () => {
	let component: GrupoPageComponent;
	let fixture: ComponentFixture<GrupoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GrupoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GrupoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
