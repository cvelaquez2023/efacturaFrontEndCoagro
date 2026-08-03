/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TransaccionesConfigurableConsecutivoPageComponent } from './transaccionesConfigurableConsecutivo-page.component';

describe('TransaccionesConfigurableConsecutivoPageComponent', () => {
	let component: TransaccionesConfigurableConsecutivoPageComponent;
	let fixture: ComponentFixture<TransaccionesConfigurableConsecutivoPageComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TransaccionesConfigurableConsecutivoPageComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TransaccionesConfigurableConsecutivoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
