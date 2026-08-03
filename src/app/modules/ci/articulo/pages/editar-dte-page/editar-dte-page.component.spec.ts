import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDtePageComponent } from './editar-dte-page.component';

describe('EditarDtePageComponent', () => {
	let component: EditarDtePageComponent;
	let fixture: ComponentFixture<EditarDtePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EditarDtePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EditarDtePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
