import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodImpuestoPageComponent } from './cod-impuesto-page.component';

describe('CodImpuestoPageComponent', () => {
	let component: CodImpuestoPageComponent;
	let fixture: ComponentFixture<CodImpuestoPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CodImpuestoPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CodImpuestoPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
