import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetasVentaCobroPageComponent } from './metas-venta-cobro-page.component';

describe('MetasVentaCobroPageComponent', () => {
	let component: MetasVentaCobroPageComponent;
	let fixture: ComponentFixture<MetasVentaCobroPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MetasVentaCobroPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MetasVentaCobroPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
