import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasConsignacionPageComponent } from './ventas-consignacion-page.component';

describe('VentasConsignacionPageComponent', () => {
	let component: VentasConsignacionPageComponent;
	let fixture: ComponentFixture<VentasConsignacionPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [VentasConsignacionPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(VentasConsignacionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
