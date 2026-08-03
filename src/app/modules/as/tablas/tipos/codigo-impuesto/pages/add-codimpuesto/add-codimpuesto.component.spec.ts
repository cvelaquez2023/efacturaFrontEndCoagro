import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCodimpuestoComponent } from './add-codimpuesto.component';

describe('AddCodimpuestoComponent', () => {
	let component: AddCodimpuestoComponent;
	let fixture: ComponentFixture<AddCodimpuestoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddCodimpuestoComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddCodimpuestoComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
