import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCatProveedorPageComponent } from './add-cat-proveedor-page.component';

describe('AddCatProveedorPageComponent', () => {
	let component: AddCatProveedorPageComponent;
	let fixture: ComponentFixture<AddCatProveedorPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddCatProveedorPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddCatProveedorPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
