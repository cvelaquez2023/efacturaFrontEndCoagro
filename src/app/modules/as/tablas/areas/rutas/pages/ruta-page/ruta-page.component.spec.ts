import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutaPageComponent } from './ruta-page.component';

describe('RutaPageComponent', () => {
	let component: RutaPageComponent;
	let fixture: ComponentFixture<RutaPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [RutaPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(RutaPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
