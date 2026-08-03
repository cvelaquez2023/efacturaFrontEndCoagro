import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCatArticuloPageComponent } from './add-cat-articulo-page.component';

describe('AddCatArticuloPageComponent', () => {
	let component: AddCatArticuloPageComponent;
	let fixture: ComponentFixture<AddCatArticuloPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddCatArticuloPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddCatArticuloPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
