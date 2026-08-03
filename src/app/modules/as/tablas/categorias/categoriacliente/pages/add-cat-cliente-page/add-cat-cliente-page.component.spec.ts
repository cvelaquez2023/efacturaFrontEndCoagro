import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCatClientePageComponent } from './add-cat-cliente-page.component';

describe('AddCatClientePageComponent', () => {
	let component: AddCatClientePageComponent;
	let fixture: ComponentFixture<AddCatClientePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddCatClientePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddCatClientePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
