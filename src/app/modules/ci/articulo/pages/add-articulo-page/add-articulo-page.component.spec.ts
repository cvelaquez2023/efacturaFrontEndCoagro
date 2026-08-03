import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticuloPageComponent } from './add-articulo-page.component';

describe('AddArticuloPageComponent', () => {
	let component: AddArticuloPageComponent;
	let fixture: ComponentFixture<AddArticuloPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddArticuloPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddArticuloPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
