import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobarDevolucionPageComponent } from './aprobar-devolucion-page.component';

describe('AprobarDevolucionPageComponent', () => {
	let component: AprobarDevolucionPageComponent;
	let fixture: ComponentFixture<AprobarDevolucionPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AprobarDevolucionPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AprobarDevolucionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
