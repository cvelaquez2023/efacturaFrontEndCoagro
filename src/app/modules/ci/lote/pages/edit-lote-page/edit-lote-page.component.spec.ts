import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLotePageComponent } from './edit-lote-page.component';

describe('EditLotePageComponent', () => {
	let component: EditLotePageComponent;
	let fixture: ComponentFixture<EditLotePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EditLotePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EditLotePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
