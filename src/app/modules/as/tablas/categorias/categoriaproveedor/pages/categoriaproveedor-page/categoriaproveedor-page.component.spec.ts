import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaproveedorPageComponent } from './categoriaproveedor-page.component';

describe('CategoriaproveedorPageComponent', () => {
	let component: CategoriaproveedorPageComponent;
	let fixture: ComponentFixture<CategoriaproveedorPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CategoriaproveedorPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CategoriaproveedorPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
