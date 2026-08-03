import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTipoImpuestoComponent } from './add-tipo-impuesto.component';

describe('AddTipoImpuestoComponent', () => {
	let component: AddTipoImpuestoComponent;
	let fixture: ComponentFixture<AddTipoImpuestoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddTipoImpuestoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddTipoImpuestoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
