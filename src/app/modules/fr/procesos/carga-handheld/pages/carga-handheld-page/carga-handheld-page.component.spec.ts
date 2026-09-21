import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaHandheldPageComponent } from './carga-handheld-page.component';

describe('CargaHandheldPageComponent', () => {
	let component: CargaHandheldPageComponent;
	let fixture: ComponentFixture<CargaHandheldPageComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CargaHandheldPageComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CargaHandheldPageComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
