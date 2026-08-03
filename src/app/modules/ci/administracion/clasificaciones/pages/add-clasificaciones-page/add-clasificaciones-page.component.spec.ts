import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClasificacionesPageComponent } from './add-clasificaciones-page.component';

describe('AddClasificacionesPageComponent', () => {
	let component: AddClasificacionesPageComponent;
	let fixture: ComponentFixture<AddClasificacionesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AddClasificacionesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AddClasificacionesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
