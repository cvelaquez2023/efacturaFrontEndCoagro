import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaClientesPageComponent } from './carga-clientes-page.component';

describe('CargaClientesPageComponent', () => {
	let component: CargaClientesPageComponent;
	let fixture: ComponentFixture<CargaClientesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CargaClientesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CargaClientesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
