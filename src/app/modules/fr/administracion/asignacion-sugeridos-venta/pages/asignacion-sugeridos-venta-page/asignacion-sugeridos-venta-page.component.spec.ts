import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionSugeridosVentaPageComponent } from './asignacion-sugeridos-venta-page.component';

describe('AsignacionSugeridosVentaPageComponent', () => {
	let component: AsignacionSugeridosVentaPageComponent;
	let fixture: ComponentFixture<AsignacionSugeridosVentaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AsignacionSugeridosVentaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AsignacionSugeridosVentaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
