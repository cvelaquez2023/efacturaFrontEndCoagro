import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodegasPageComponent } from './bodegas-page.component';

describe('BodegasPageComponent', () => {
	let component: BodegasPageComponent;
	let fixture: ComponentFixture<BodegasPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BodegasPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BodegasPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
