import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUnidaMedidaPageComponent } from './add-unida-medida-page.component';

describe('AddUnidaMedidaPageComponent', () => {
	let component: AddUnidaMedidaPageComponent;
	let fixture: ComponentFixture<AddUnidaMedidaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddUnidaMedidaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddUnidaMedidaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
