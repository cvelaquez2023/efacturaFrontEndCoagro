import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearInvalidacionPageComponent } from './crear-invalidacion-page.component';

describe('CrearInvalidacionPageComponent', () => {
	let component: CrearInvalidacionPageComponent;
	let fixture: ComponentFixture<CrearInvalidacionPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CrearInvalidacionPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CrearInvalidacionPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
