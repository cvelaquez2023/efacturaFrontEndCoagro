import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClasificacionesPageComponent } from './clasificaciones-page.component';

describe('ClasificacionesPageComponent', () => {
	let component: ClasificacionesPageComponent;
	let fixture: ComponentFixture<ClasificacionesPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ClasificacionesPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ClasificacionesPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
