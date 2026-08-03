import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlInventarioPageComponent } from './control-inventario-page.component';

describe('ControlInventarioPageComponent', () => {
	let component: ControlInventarioPageComponent;
	let fixture: ComponentFixture<ControlInventarioPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ControlInventarioPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ControlInventarioPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
