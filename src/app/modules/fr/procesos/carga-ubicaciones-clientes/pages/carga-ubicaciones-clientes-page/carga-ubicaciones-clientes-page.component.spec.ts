import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaUbicacionesClientesPageComponent } from './carga-ubicaciones-clientes-page.component';

describe('CargaUbicacionesClientesPageComponent', () => {
	let component: CargaUbicacionesClientesPageComponent;
	let fixture: ComponentFixture<CargaUbicacionesClientesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CargaUbicacionesClientesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CargaUbicacionesClientesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
