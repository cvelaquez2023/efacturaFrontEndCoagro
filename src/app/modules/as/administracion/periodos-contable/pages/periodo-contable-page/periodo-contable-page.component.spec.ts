import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodoContablePageComponent } from './periodo-contable-page.component';

describe('PeriodoContablePageComponent', () => {
	let component: PeriodoContablePageComponent;
	let fixture: ComponentFixture<PeriodoContablePageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PeriodoContablePageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PeriodoContablePageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
