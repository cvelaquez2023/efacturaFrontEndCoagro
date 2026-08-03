import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNivelPrecioPageComponent } from './add-nivel-precio-page.component';

describe('AddNivelPrecioPageComponent', () => {
	let component: AddNivelPrecioPageComponent;
	let fixture: ComponentFixture<AddNivelPrecioPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddNivelPrecioPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddNivelPrecioPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
