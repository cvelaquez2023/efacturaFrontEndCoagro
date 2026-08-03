import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLotePageComponent } from './add-lote-page.component';

describe('AddLotePageComponent', () => {
	let component: AddLotePageComponent;
	let fixture: ComponentFixture<AddLotePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddLotePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddLotePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
