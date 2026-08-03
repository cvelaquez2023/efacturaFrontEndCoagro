import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTipoAnulacionComponent } from './add-tipo-anulacion.component';

describe('AddTipoAnulacionComponent', () => {
	let component: AddTipoAnulacionComponent;
	let fixture: ComponentFixture<AddTipoAnulacionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddTipoAnulacionComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddTipoAnulacionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
