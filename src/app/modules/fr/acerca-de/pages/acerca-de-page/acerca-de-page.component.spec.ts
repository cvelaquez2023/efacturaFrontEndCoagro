import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcercaDePageComponent } from './acerca-de-page.component';

describe('AcercaDePageComponent', () => {
	let component: AcercaDePageComponent;
	let fixture: ComponentFixture<AcercaDePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AcercaDePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AcercaDePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
