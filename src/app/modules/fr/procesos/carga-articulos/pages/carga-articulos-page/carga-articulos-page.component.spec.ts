import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaArticulosPageComponent } from './carga-articulos-page.component';

describe('CargaArticulosPageComponent', () => {
	let component: CargaArticulosPageComponent;
	let fixture: ComponentFixture<CargaArticulosPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CargaArticulosPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CargaArticulosPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
