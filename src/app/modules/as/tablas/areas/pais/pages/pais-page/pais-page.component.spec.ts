import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaisPageComponent } from './pais-page.component';

describe('PaisPageComponent', () => {
	let component: PaisPageComponent;
	let fixture: ComponentFixture<PaisPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PaisPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PaisPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
