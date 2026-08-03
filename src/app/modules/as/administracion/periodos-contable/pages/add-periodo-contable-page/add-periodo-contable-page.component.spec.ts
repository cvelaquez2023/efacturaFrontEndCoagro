import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPeriodoContablePageComponent } from './add-periodo-contable-page.component';

describe('AddPeriodoContablePageComponent', () => {
	let component: AddPeriodoContablePageComponent;
	let fixture: ComponentFixture<AddPeriodoContablePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddPeriodoContablePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddPeriodoContablePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
