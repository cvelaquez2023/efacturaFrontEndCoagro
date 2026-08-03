import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AplicarCpPageComponent } from './aplicar-cp-page.component';

describe('AplicarCpPageComponent', () => {
	let component: AplicarCpPageComponent;
	let fixture: ComponentFixture<AplicarCpPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AplicarCpPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AplicarCpPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
