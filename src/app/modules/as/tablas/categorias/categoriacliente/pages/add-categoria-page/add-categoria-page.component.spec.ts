import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoriaPageComponent } from './add-categoria-page.component';

describe('AddCategoriaPageComponent', () => {
	let component: AddCategoriaPageComponent;
	let fixture: ComponentFixture<AddCategoriaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddCategoriaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddCategoriaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
