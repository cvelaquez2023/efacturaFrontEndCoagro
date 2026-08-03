/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TiponitsPageComponent } from './tiponits-page.component';

describe('TiponitsPageComponent', () => {
	let component: TiponitsPageComponent;
	let fixture: ComponentFixture<TiponitsPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TiponitsPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TiponitsPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
